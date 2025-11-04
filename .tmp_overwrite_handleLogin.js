const fs = require('fs');
const path = 'src/components/login/LoginForm.jsx';
let code = fs.readFileSync(path, 'utf8');
const start = code.indexOf('const handleLogin = async');
if (start === -1) throw new Error('handleLogin start not found');
let returnIdx = code.indexOf('\r\n  return (', start);
if (returnIdx === -1) {
  returnIdx = code.indexOf('\n  return (', start);
}
if (returnIdx === -1) throw new Error('return block after handleLogin not found');
const newBlock = `const handleLogin = async (email, password) => {
  if (isLoggingIn) {
    return;
  }

  setIsLoggingIn(true);
  Keyboard.dismiss();

  try {
    const approval = await checkUserApprovalStatus(email);

    if (!approval.exists || approval.error) {
      handleDataError('Impossibile trovare i dati del tuo account. Contatta il supporto.');
      if (approval?.error) {
        console.error('User approval lookup error:', approval.error);
      }
      return;
    }

    if (!approval.isApproved) {
      const message =
        approval.status === 'pending'
          ? "Il tuo account e in attesa di approvazione da parte di un amministratore. Riceverai una notifica quando potrai effettuare l'accesso."
          : "Il tuo account non e autorizzato ad accedere all'app. Contatta un amministratore per assistenza.";

      handleDataError(message);

      if (approval.status === 'pending') {
        navigation.navigate('PendingApproval');
      }
      return;
    }

    const credentials = await firebase.auth().signInWithEmailAndPassword(email, password);

    if (approval.status !== 'approved' && approval.userDocRef) {
      try {
        await approval.userDocRef.set(
          {
            status: 'approved',
            approvedAt:
              approval.rawApprovedAt || firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } catch (statusSyncError) {
        console.warn('Unable to sync user approval status:', statusSyncError);
      }
    }

    const appwriteData = await createAppwriteSession(email, password);

    const userData = {
      uid: credentials.user.uid,
      email: credentials.user.email,
      appwriteUserId: appwriteData.userId,
      appwriteSessionId: appwriteData.sessionId,
      appwriteExpire: appwriteData.expire,
      appwriteSecret: appwriteData.secret,
      loginTimestamp: new Date().toISOString(),
      appwriteUserData: {
        name: appwriteData.appwriteUser.name || '',
        emailVerification: appwriteData.appwriteUser.emailVerification || false,
        status: appwriteData.appwriteUser.status || false,
      },
    };

    await saveUserSecurely(userData, password);
  } catch (error) {
    console.error('Login error:', error);

    try {
      if (firebase.auth().currentUser) {
        await firebase.auth().signOut();
      }
      await appwriteAccount.deleteSession('current').catch(() => {});
    } catch (cleanupError) {
      console.warn('Cleanup after login failure failed:', cleanupError);
    }

    if (error?.code) {
      handleDataError(getFirebaseErrorMessage(error));
      if (error.code === 'auth/user-disabled') {
        navigation.navigate('PendingApproval');
      }
    } else {
      handleDataError('Si e verificato un errore durante il login. Riprova.');
    }
  } finally {
    setIsLoggingIn(false);
  }
};`;
code = code.slice(0, start) + newBlock + '\r\n\r\n' + code.slice(returnIdx + 2);
fs.writeFileSync(path, code);
