import { withAuthorization } from '@/lib/withAuthorization';

export default withAuthorization(['conducteur'], async (req, res, user) => {
  return res.status(200).json({ message: `Hello Conducteur ${user.name}` });
});
