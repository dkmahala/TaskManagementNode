module.exports = {
    getUserByEmail: 'SELECT * FROM users WHERE email = @email',
    createUser: `
      INSERT INTO users (name, email, password_hash)
      OUTPUT inserted.id, inserted.name, inserted.email, inserted.created_at
      VALUES (@name, @email, @password_hash);
    `,
  };