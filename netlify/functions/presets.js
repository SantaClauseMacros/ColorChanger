const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event, context) => {
  const { user } = context.clientContext;

  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Not authenticated' })
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Get user presets
      const { data: presets, error } = await supabase
        .from('presets')
        .select('*')
        .eq('user_id', user.sub)
        .order('created', { ascending: false });

      if (error) throw error;

      return {
        statusCode: 200,
        body: JSON.stringify({ presets })
      };

    } else if (event.httpMethod === 'POST') {
      // Save new preset
      const { name, data } = JSON.parse(event.body);

      const { data: preset, error } = await supabase
        .from('presets')
        .insert([{
          user_id: user.sub,
          name: name,
          preset_data: data,
          created: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        statusCode: 200,
        body: JSON.stringify({ preset })
      };

    } else if (event.httpMethod === 'DELETE') {
      // Delete preset
      const presetId = event.queryStringParameters.id;

      const { error } = await supabase
        .from('presets')
        .delete()
        .eq('id', presetId)
        .eq('user_id', user.sub);

      if (error) throw error;

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    }

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};