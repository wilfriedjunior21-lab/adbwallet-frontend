const KYCForm = ({ userId }) => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("idCard", file);
    formData.append("userId", userId);

    await axios.post("http://localhost:5000/api/user/upload-kyc", formData);
    alert("Vérification en cours par l'administrateur.");
  };

  return (
    <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400">
      <p className="font-bold">Vérification d'identité requise</p>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="my-2"
      />
      <button
        onClick={handleUpload}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Envoyer ma pièce d'identité
      </button>
    </div>
  );
};
