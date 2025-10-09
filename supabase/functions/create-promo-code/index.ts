import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.55.0";
import sodium from "npm:libsodium-wrappers-sumo@0.7.15";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreatePromoCodeRequest {
  code: string;
  store: string;
  discount: string;
  expires: string | null;
  notes: string;
  masterPassword: string;
}

interface EncryptionResult {
  encryptedData: string;
  nonce: string;
  tag: string;
}

const ARGON2_MEMORY = 64 * 1024 * 1024;
const ARGON2_ITERATIONS = 3;

async function deriveKey(
  masterPassword: string,
  salt: Uint8Array
): Promise<Uint8Array> {
  await sodium.ready;
  
  const key = sodium.crypto_pwhash(
    32,
    masterPassword,
    salt,
    ARGON2_ITERATIONS,
    ARGON2_MEMORY,
    sodium.crypto_pwhash_ALG_ARGON2ID13
  );
  
  return key;
}

async function encryptCode(
  code: string,
  promoCodeId: string,
  key: Uint8Array,
  userId: string
): Promise<EncryptionResult> {
  await sodium.ready;
  
  const nonce = sodium.randombytes_buf(
    sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
  );
  
  const aadString = `${userId}:${promoCodeId}`;
  const aad = new TextEncoder().encode(aadString);
  
  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    code,
    aad,
    null,
    nonce,
    key
  );
  
  const tagLength = sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES;
  const encryptedData = ciphertext.slice(0, -tagLength);
  const tag = ciphertext.slice(-tagLength);
  
  return {
    encryptedData: sodium.to_base64(encryptedData),
    nonce: sodium.to_base64(nonce),
    tag: sodium.to_base64(tag),
  };
}

function generateSalt(): Uint8Array {
  return sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    await sodium.ready;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body: CreatePromoCodeRequest = await req.json();

    if (
      !body.code ||
      !body.store ||
      !body.discount ||
      !body.masterPassword
    ) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: code, store, discount, masterPassword",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let userSalt: Uint8Array;
    const { data: saltData, error: saltError } = await supabaseClient
      .from("user_key_salts")
      .select("salt")
      .eq("user_id", user.id)
      .maybeSingle();

    if (saltError) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch user salt: ${saltError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!saltData) {
      userSalt = generateSalt();
      const saltBase64 = sodium.to_base64(userSalt);

      const { error: createSaltError } = await supabaseClient
        .from("user_key_salts")
        .insert({ user_id: user.id, salt: saltBase64 });

      if (createSaltError) {
        return new Response(
          JSON.stringify({
            error: `Failed to create user salt: ${createSaltError.message}`,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else {
      userSalt = sodium.from_base64(saltData.salt);
    }

    const encryptionKey = await deriveKey(body.masterPassword, userSalt);

    const promoCodeId = crypto.randomUUID();

    const encryptedResult = await encryptCode(
      body.code,
      promoCodeId,
      encryptionKey,
      user.id
    );

    const { data: codeData, error: codeError } = await supabaseClient
      .from("promo_codes")
      .insert({
        id: promoCodeId,
        user_id: user.id,
        encrypted_data: encryptedResult.encryptedData,
        nonce: encryptedResult.nonce,
        tag: encryptedResult.tag,
      })
      .select()
      .single();

    if (codeError) {
      return new Response(
        JSON.stringify({ error: `Failed to create promo code: ${codeError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: metadataData, error: metadataError } = await supabaseClient
      .from("promo_code_metadata")
      .insert({
        id: promoCodeId,
        store: body.store,
        discount: body.discount,
        expires: body.expires,
        notes: body.notes || "",
      })
      .select()
      .single();

    if (metadataError) {
      await supabaseClient.from("promo_codes").delete().eq("id", promoCodeId);
      return new Response(
        JSON.stringify({
          error: `Failed to create promo metadata: ${metadataError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        promoCode: {
          id: codeData.id,
          store: metadataData.store,
          discount: metadataData.discount,
          expires: metadataData.expires,
          notes: metadataData.notes,
          created_at: codeData.created_at,
        },
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating promo code:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});