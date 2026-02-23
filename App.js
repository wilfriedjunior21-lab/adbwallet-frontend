import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

import { Toaster, toast } from "react-hot-toast";

// Dans la fonction de soumission KYC
const handleUpload = async () => {
  try {
    await axios.post("...", formData);
    toast.success(
      "Document envoyé ! Un email vous sera envoyé après vérification."
    );
  } catch (err) {
    toast.error("Erreur lors de l'envoi.");
  }
};
