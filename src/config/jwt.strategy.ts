export const jwtConfig = {
    secret: process.env.JWT_SECRET || 'sua_chave_secreta_segura',
    signOptions: { expiresIn: '3h' },
  };