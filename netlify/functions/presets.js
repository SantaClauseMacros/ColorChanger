
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

  const userId = user.sub;
  const method = event.httpMethod;

  try {
    if (method === 'GET') {
      // Get user presets
      const { data: presets, error } = await supabase
        .from('presets')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return {
        statusCode: 200,
        body: JSON.stringify({ presets })
      };
    }

    if (method === 'POST') {
      // Save new preset
      const { name, data } = JSON.parse(event.body);
      
      const { data: preset, error } = await supabase
        .from('presets')
        .insert({
          user_id: userId,
          name,
          preset_data: data,
          created: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        statusCode: 201,
        body: JSON.stringify(preset)
      };
    }

    if (method === 'DELETE') {
      // Delete preset
      const { id } = JSON.parse(event.body);
      
      const { error } = await supabase
        .from('presets')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    }

    if (method === 'DELETE') {
      // Delete preset
      const { id } = JSON.parse(event.body);
      
      await client.query(
        q.Delete(q.Ref(q.Collection('presets'), id))
      );

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
