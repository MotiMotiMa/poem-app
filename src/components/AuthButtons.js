import supabase from "../supabaseClient";


function AuthButtons({ user }) {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000",
      },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ textAlign: "center", marginBottom: "1rem" }}>
      {user ? (
        <>
          <p>ログイン中: {user.email}</p>
          <button onClick={logout}>ログアウト ✋</button>
        </>
      ) : (
        <button onClick={login}>Googleでログイン 🎉</button>
      )}
    </div>
  );
}

export default AuthButtons;
