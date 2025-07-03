import { withAuthorization } from '@/lib/withAuthorization';

export default withAuthorization(['passager'], async (req, res, user) => {
  return res.status(200).json({ message: `Hello Passager ${user.name}` });
});
