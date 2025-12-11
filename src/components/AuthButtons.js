import supabase from "../supabaseClient";

function AuthButtons({ user }) {
  const login = async () => {
    const redirectUrl =
      process.env.NODE_ENV === "production"
        ? "https://poem-app-blond.vercel.app"   // ← 本番URL（あなたのURLに変更）
        : "http://localhost:3000";        // ← 開発時のみ

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
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
