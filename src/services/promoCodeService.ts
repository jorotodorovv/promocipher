import { supabase } from './supabase';
import type { EncryptedPromoCode, PromoMetadata, PromoCodeWithMetadata, PromoCodeData } from '../types/promoCode';

// Database operations for encrypted promo codes
export const promoCodeService = {
  // Fetch all promo codes with metadata for the current user
  async getAll(): Promise<PromoCodeWithMetadata[]> {
    const { data, error } = await supabase
      .from('promo_codes')
      .select(`
        id,
        user_id,
        encrypted_data,
        nonce,
        tag,
        created_at:created_at,
        updated_at:updated_at,
        promo_code_metadata!inner (
          store,
          discount,
          expires,
          notes,
          created_at,
          updated_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch promo codes: ${error.message}`);
    }

    // Transform the joined data into the expected format
    const transformedData: PromoCodeWithMetadata[] = (data || []).map(item => {
      const metadata = Array.isArray(item.promo_code_metadata) 
        ? item.promo_code_metadata[0] 
        : item.promo_code_metadata;
      
      return {
        id: item.id,
        user_id: item.user_id,
        encrypted_data: item.encrypted_data,
        nonce: item.nonce,
        tag: item.tag,
        created_at: item.created_at,
        updated_at: item.updated_at,
        store: metadata?.store || '',
        discount: metadata?.discount || '',
        expires: metadata?.expires || '',
        notes: metadata?.notes || '',
        metadata_created_at: metadata?.created_at || '',
        metadata_updated_at: metadata?.updated_at || ''
      };
    });

    return transformedData;
  },

  async getPaginated({
    offset = 0,
    limit = 10,
    searchStore = '',
    filter = 'all'
  }: {
    offset?: number;
    limit?: number;
    searchStore?: string;
    filter?: 'all' | 'active' | 'expiring' | 'expired';
  } = {}): Promise<{ data: PromoCodeWithMetadata[]; hasMore: boolean; total: number }> {
    let query = supabase
      .from('promo_codes')
      .select(`
        id,
        user_id,
        encrypted_data,
        nonce,
        tag,
        created_at:created_at,
        updated_at:updated_at,
        promo_code_metadata!inner (
          store,
          discount,
          expires,
          notes,
          created_at,
          updated_at
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add search filter if provided
    if (searchStore.trim()) {
      query = query.filter('promo_code_metadata.store', 'ilike', `%${searchStore.trim()}%`);
    }

    // Add status filter based on expires date
    const now = new Date().toISOString();
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    if (filter === 'active') {
      // Active: not expired (expires >= now)
      query = query.filter('promo_code_metadata.expires', 'gte', now.split('T')[0]);
    } else if (filter === 'expired') {
      // Expired: expires < now
      query = query.filter('promo_code_metadata.expires', 'lt', now.split('T')[0]);
    } else if (filter === 'expiring') {
      // Expiring soon: expires between now and 30 days from now
      query = query.filter('promo_code_metadata.expires', 'gte', now.split('T')[0])
                   .filter('promo_code_metadata.expires', 'lte', thirtyDaysFromNow.split('T')[0]);
    }
    // 'all' filter doesn't add any additional constraints

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch promo codes: ${error.message}`);
    }

    // Transform the joined data into the expected format
    const transformedData: PromoCodeWithMetadata[] = (data || []).map(item => {
      const metadata = Array.isArray(item.promo_code_metadata) 
        ? item.promo_code_metadata[0] 
        : item.promo_code_metadata;
      
      return {
        id: item.id,
        user_id: item.user_id,
        encrypted_data: item.encrypted_data,
        nonce: item.nonce,
        tag: item.tag,
        created_at: item.created_at,
        updated_at: item.updated_at,
        store: metadata?.store || '',
        discount: metadata?.discount || '',
        expires: metadata?.expires || '',
        notes: metadata?.notes || '',
        metadata_created_at: metadata?.created_at || '',
        metadata_updated_at: metadata?.updated_at || ''
      };
    });

    const total = count || 0;
    const hasMore = offset + limit < total;

    return {
      data: transformedData,
      hasMore,
      total
    };
  },

  // Create a new promo code with encrypted code and unencrypted metadata
  async create(
    encryptedCode: Omit<EncryptedPromoCode, 'created_at' | 'updated_at'>,
    metadata: Omit<PromoMetadata, 'created_at' | 'updated_at'>
  ): Promise<PromoCodeWithMetadata> {
    // Start a transaction-like operation by inserting both records
    const { data: codeData, error: codeError } = await supabase
      .from('promo_codes')
      .insert(encryptedCode)
      .select()
      .single();

    if (codeError) {
      throw new Error(`Failed to create promo code: ${codeError.message}`);
    }

    // Insert metadata
    const { data: metadataData, error: metadataError } = await supabase
      .from('promo_code_metadata')
      .insert(metadata)
      .select()
      .single();

    if (metadataError) {
      // If metadata insert fails, clean up the promo code
      await supabase.from('promo_codes').delete().eq('id', encryptedCode.id);
      throw new Error(`Failed to create promo metadata: ${metadataError.message}`);
    }

    // Return combined data
    return {
      id: codeData.id,
      user_id: codeData.user_id,
      encrypted_data: codeData.encrypted_data,
      nonce: codeData.nonce,
      tag: codeData.tag,
      created_at: codeData.created_at,
      updated_at: codeData.updated_at,
      store: metadataData.store,
      discount: metadataData.discount,
      expires: metadataData.expires,
      notes: metadataData.notes,
      metadata_created_at: metadataData.created_at,
      metadata_updated_at: metadataData.updated_at
    };
  },

  // Update an existing promo code (code or metadata)
  async updateCode(id: string, updates: Partial<Pick<EncryptedPromoCode, 'encrypted_data' | 'nonce' | 'tag'>>): Promise<void> {
    const { error } = await supabase
      .from('promo_codes')
      .update(updates)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update encrypted promo code: ${error.message}`);
    }
  },

  // Update promo code metadata
  async updateMetadata(id: string, updates: Partial<Pick<PromoMetadata, 'store' | 'discount' | 'expires' | 'notes'>>): Promise<void> {
    const { error } = await supabase
      .from('promo_code_metadata')
      .update(updates)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update promo metadata: ${error.message}`);
    }
  },

  // Delete a promo code (metadata will be cascade deleted)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete promo code: ${error.message}`);
    }
  },

  // Delete all promo codes for the current user (metadata will be cascade deleted)
  async deleteAll(): Promise<void> {
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows for current user (RLS handles user filtering)

    if (error) {
      throw new Error(`Failed to delete all promo codes: ${error.message}`);
    }
  }
};