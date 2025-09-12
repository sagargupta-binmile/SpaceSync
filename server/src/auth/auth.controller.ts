import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirects to Google login
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res) {
    if (req.user?.access_token) {
      // :white_tick: Success -> token bhejo
      res.send(`
      <script>
        window.opener.postMessage({ access_token: '${req.user.access_token}' }, 'http://localhost:5173');
        window.close();
      </script>
    `);
    } else {
      // :x: Error case (UnauthorizedException se aaya hoga)
      const error = req.user?.message || 'Login failed';
      res.send(`
      <script>
        window.opener.postMessage({ error: "${error}" }, 'http://localhost:5173');
        window.close();
      </script>
    `);
    }
  }
}
