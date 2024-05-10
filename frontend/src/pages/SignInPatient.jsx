import NavbarController from "../components/Navbar/NavbarController";
import SignInFormPatient from "../components/Forms/SignInFormPatient";

function SignInPatient({ role, resetLink, signupLink }) {
  return (
    <>
      <NavbarController type={0} page="Sign In" color="blue" />
      <div className="grid items-center justify-center w-full min-h-screen grid-cols-4 px-20 pt-12 mx-auto min-w-screen">
        <SignInFormPatient
          role={role}
          resetLink={resetLink}
          signupLink={signupLink}
        />
      </div>
    </>
  );
}

export default SignInPatient;
