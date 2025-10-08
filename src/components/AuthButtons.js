function AuthButtons({ user, onLogin, onLogout }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "1rem" }}>
      {user ? (
        <>
          <p>ログイン中: {user.email}</p>
          <button onClick={onLogout}>ログアウト ✋</button>
        </>
      ) : (
        <button onClick={onLogin}>Googleでログイン 🎉</button>
      )}
    </div>
  );
}

export default AuthButtons;
