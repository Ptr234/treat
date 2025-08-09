import { OAuth2Client } from 'google-auth-library';

class GoogleOAuthService {
  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  async verifyIdToken(idToken) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new Error('Invalid token payload');
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified,
        firstName: payload.given_name,
        lastName: payload.family_name,
        profilePicture: payload.picture,
        locale: payload.locale
      };
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  }

  async exchangeCodeForTokens(authorizationCode) {
    try {
      const { tokens } = await this.client.getToken(authorizationCode);
      
      if (!tokens.id_token) {
        throw new Error('No ID token received from Google');
      }

      const userInfo = await this.verifyIdToken(tokens.id_token);
      
      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        idToken: tokens.id_token,
        userInfo
      };
    } catch (error) {
      console.error('Google code exchange failed:', error);
      throw new Error('Failed to exchange authorization code');
    }
  }

  getAuthUrl(state = '') {
    const scopes = [
      'openid',
      'email',
      'profile'
    ];

    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: state,
      prompt: 'consent'
    });
  }

  async refreshAccessToken(refreshToken) {
    try {
      this.client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await this.client.refreshAccessToken();
      
      return {
        accessToken: credentials.access_token,
        refreshToken: credentials.refresh_token || refreshToken,
        expiryDate: credentials.expiry_date
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  async revokeToken(token) {
    try {
      await this.client.revokeToken(token);
      return { success: true };
    } catch (error) {
      console.error('Token revocation failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new GoogleOAuthService();