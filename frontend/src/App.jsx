import './App.css'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton
} from '@clerk/clerk-react';
function App() {

  return (
    <>
      <h1>Welcome to IntervuX</h1>
      <SignedOut>
      
      <SignInButton mode="modal"> Click </SignInButton>
      {/* <SignInButton 
      mode="modal"
      /> */}
      </SignedOut>

      <SignedIn>
        <SignOutButton />
      </SignedIn>

      <UserButton/>
    </>
  )
}

export default App
