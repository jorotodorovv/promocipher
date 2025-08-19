import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promoCodeService } from '../services/promoCodeService';
import type { PromoCodeWithMetadata, EncryptedPromoCode, PromoMetadata } from '../types/promoCode';

// Query key factory for consistent cache management
export const promoCodeKeys = {
  all: ['promoCodes'] as const,
  lists: () => [...promoCodeKeys.all, 'list'] as const,
  list: (searchStore?: string, filter?: string) => [...promoCodeKeys.lists(), { searchStore, filter }] as const,
  stats: () => [...promoCodeKeys.all, 'stats'] as const,
  stat: (searchStore?: string) => [...promoCodeKeys.stats(), { searchStore }] as const,
  details: () => [...promoCodeKeys.all, 'detail'] as const,
  detail: (id: string) => [...promoCodeKeys.details(), id] as const,
};

// Infinite query hook for paginated promo codes with search and filter
export const useInfinitePromoCodes = (searchStore: string = '', filter: 'all' | 'active' | 'expiring' | 'expired' = 'all') => {
  return useInfiniteQuery({
    queryKey: promoCodeKeys.list(searchStore, filter),
    queryFn: ({ pageParam = 0 }) => 
      promoCodeService.getPaginated({
        offset: pageParam,
        limit: 3,
        searchStore: searchStore,
        filter: filter,
      }),
    getNextPageParam: (lastPage: { data: PromoCodeWithMetadata[]; hasMore: boolean; total: number }, allPages: any[]) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length * 3; // offset for next page
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching all promo codes for stats calculation (search-only, no status filter)
export const usePromoCodesForStats = (searchStore: string = '') => {
  return useInfiniteQuery({
    queryKey: promoCodeKeys.stat(searchStore),
    queryFn: ({ pageParam = 0 }) => 
      promoCodeService.getPaginated({
        offset: pageParam,
        limit: 1000, // Large limit to get all codes for stats
        searchStore: searchStore,
        filter: 'all', // Always use 'all' for stats calculation
      }),
    getNextPageParam: (lastPage: { data: PromoCodeWithMetadata[]; hasMore: boolean; total: number }, allPages: any[]) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length * 1000; // offset for next page
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation hooks for CRUD operations
export const useCreatePromoCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      encryptedCode, 
      metadata 
    }: { 
      encryptedCode: Omit<EncryptedPromoCode, 'created_at' | 'updated_at'>;
      metadata: Omit<PromoMetadata, 'created_at' | 'updated_at'>;
    }) => promoCodeService.create(encryptedCode, metadata),
    onSuccess: () => {
      // Invalidate all promo code queries to refetch data
      queryClient.invalidateQueries({ queryKey: promoCodeKeys.all });
    },
  });
};

export const useUpdatePromoCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      metadata 
    }: { 
      id: string;
      metadata: Partial<Pick<PromoMetadata, 'store' | 'discount' | 'expires' | 'notes'>>;
    }) => promoCodeService.updateMetadata(id, metadata),
    onSuccess: () => {
      // Invalidate all promo code queries to refetch data
      queryClient.invalidateQueries({ queryKey: promoCodeKeys.all });
    },
  });
};

export const useDeletePromoCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => promoCodeService.delete(id),
    onSuccess: () => {
      // Invalidate all promo code queries to refetch data
      queryClient.invalidateQueries({ queryKey: promoCodeKeys.all });
    },
  });
};

export const useDeleteAllPromoCodes = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => promoCodeService.deleteAll(),
    onSuccess: () => {
      // Invalidate all promo code queries to refetch data
      queryClient.invalidateQueries({ queryKey: promoCodeKeys.all });
    },
  });
};