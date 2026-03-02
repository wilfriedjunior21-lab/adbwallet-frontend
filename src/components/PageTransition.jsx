import { motion } from "framer-motion";

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} // La page arrive légèrement par la droite
      animate={{ opacity: 1, x: 0 }} // Elle se place au centre
      exit={{ opacity: 0, x: -20 }} // Elle sort par la gauche
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ width: "100%", minHeight: "100vh" }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
