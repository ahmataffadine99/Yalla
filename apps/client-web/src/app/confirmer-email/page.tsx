import { EmailConfirmation } from '../../components/EmailConfirmation';

type ConfirmationPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function EmailConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const { token } = await searchParams;
  return <EmailConfirmation token={token} />;
}
