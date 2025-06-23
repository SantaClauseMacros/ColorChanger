
exports.handler = async (event, context) => {
  const { user } = context.clientContext;
  
  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Not authenticated' })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ 
      user: {
        id: user.sub,
        email: user.email,
        name: user.user_metadata?.full_name || user.email
      }
    })
  };
};
