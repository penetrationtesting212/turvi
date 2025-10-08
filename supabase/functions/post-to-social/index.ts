import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { platform_account_id, content, post_id } = await req.json();
    console.log('Posting to social media:', { platform_account_id, content });

    // Fetch account credentials
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', platform_account_id)
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      throw new Error('Social account not found');
    }

    let result;
    switch (account.platform) {
      case 'twitter':
        result = await postToTwitter(content, account.credentials);
        break;
      case 'facebook':
        result = await postToFacebook(content, account.credentials);
        break;
      case 'instagram':
        result = await postToInstagram(content, account.credentials);
        break;
      case 'linkedin':
        result = await postToLinkedIn(content, account.credentials);
        break;
      default:
        throw new Error(`Platform ${account.platform} not supported`);
    }

    // Update post status
    if (post_id) {
      await supabase
        .from('social_posts')
        .update({ 
          status: 'published',
          platform_account_id: platform_account_id
        })
        .eq('id', post_id);
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error posting to social media:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Twitter/X posting
async function postToTwitter(content: string, credentials: any) {
  const { consumer_key, consumer_secret, access_token, access_token_secret } = credentials;
  
  const url = 'https://api.x.com/2/tweets';
  const method = 'POST';
  
  const oauthParams = {
    oauth_consumer_key: consumer_key,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: access_token,
    oauth_version: '1.0',
  };

  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
    Object.entries(oauthParams)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
  )}`;
  
  const signingKey = `${encodeURIComponent(consumer_secret)}&${encodeURIComponent(access_token_secret)}`;
  const hmacSha1 = createHmac('sha1', signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest('base64');

  const oauthHeader = 'OAuth ' + Object.entries({ ...oauthParams, oauth_signature: signature })
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(', ');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': oauthHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: content }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twitter API error: ${error}`);
  }

  return await response.json();
}

// Facebook posting
async function postToFacebook(content: string, credentials: any) {
  const { page_id, access_token } = credentials;
  
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${page_id}/feed`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: content,
        access_token: access_token,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Facebook API error: ${error}`);
  }

  return await response.json();
}

// Instagram posting (requires media)
async function postToInstagram(content: string, credentials: any) {
  const { account_id, access_token } = credentials;
  
  // Instagram requires media - this is a simplified version
  throw new Error('Instagram posting requires media upload. Please use Facebook Business Suite for now.');
}

// LinkedIn posting
async function postToLinkedIn(content: string, credentials: any) {
  const { person_urn, access_token } = credentials;
  
  const response = await fetch(
    'https://api.linkedin.com/v2/ugcPosts',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: person_urn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn API error: ${error}`);
  }

  return await response.json();
}
