import firebase from "../services/firebase";

const useHandleSingout = () => {
  const handleSingout = async () => {
    try {
      await firebase.auth().signOut();
    } catch (error) {
      console.log(error);
    }
  };

  return { handleSingout };
}

export default useHandleSingout