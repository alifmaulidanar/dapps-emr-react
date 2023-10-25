import NavbarController from "../components/Navbar/NavbarController";
import SignUpForm from "../components/Forms/SignUpForm";

function SignUp({ role, resetLink, signupLink }) {
  return (
    <>
      <NavbarController type={1} page="Sign In" color="blue" />
      <div className="grid grid-cols-4 justify-center items-center min-h-screen w-full min-w-screen mx-auto px-20 pt-12">
        <SignUpForm role={role} resetLink={resetLink} signupLink={signupLink} />
      </div>
    </>
  );
}

export default SignUp;
