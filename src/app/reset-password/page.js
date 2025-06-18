import dynamic from 'next/dynamic';

const ResetPasswordClient = dynamic(() => import('./ResetPasswordClient'), {
  ssr: false, // importante para evitar errores en build
});

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
