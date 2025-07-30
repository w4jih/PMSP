// pages/api/admin/dashboard.ts
import { withAuthorization } from '@/lib/withAuthorization';

export default withAuthorization(['admin'], async (req, res, user) => {
  res.status(200).json({
    message: `Welcome, ${user.name}. You have admin access.`,
    user,
  });
});
