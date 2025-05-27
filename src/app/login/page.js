"use client";
import { Toaster } from "@/components/ui/sonner";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  UserCircle, 
  Lock, 
  LogIn, 
  Eye, 
  EyeOff, 
  Mail, 
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const inputVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 }
  }
};

const logoVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      delay: 0.2,
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function LOGIN() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (error) setError("");
  }, [formData.email, formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`http://alphatek.fr:3110/api/login`, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      console.log(formData.email, formData.password);

      const result = await response.json();
      console.log(response);
      console.log(result);

      if (!response.ok) {
        throw new Error(result.message || "Échec de la connexion");
      }

      console.log("Connexion réussie :", result);

      if (!result) {
        throw new Error("Données utilisateur invalides");
      }

      const { role, mail, id } = result;

      // Stocker dans localStorage
      localStorage.setItem("email", mail);
      localStorage.setItem("id", id);
      localStorage.setItem("role", role);

     

      // console.log("Token:", token);
      // console.log("Role:", role);

      

      // setTimeout(() => {
      //   switch (role) {
      //     case "Administrateur":
      //       router.push("/dashboard");
      //       break;
      //     default:
      //       router.push("/");
      //       break;
      //   }
      // }, 1500);
      if(role === "admin") {
        setSuccess(true);
        router.push("/screens/dashboard");
      }
      else {
       setError("Vous n'avez pas accès à cette page.");
        router.replace("/");
      }
      
    } catch (err) {
      console.error("Erreur lors de la requête :", err);
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-sky-50 to-indigo-50 p-4"
    style={{backgroundImage: "url('/back.jpg')", backgroundSize: "cover", backgroundPosition: "center"}}>
     
      <motion.div
        initial="hidden"
        animate="visible"
        variants={logoVariants}
        className="mb-8 text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-600 rounded-full shadow-lg mb-4">
          <UserCircle className="text-white w-8 h-8" />
        </div>
        <Toaster/>
        <h1 className="text-2xl font-bold text-gray-800">Bienvenue</h1>
        <p className="text-gray-500 mt-1">Connectez-vous à votre compte</p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={formVariants}
        className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden"
      >
        {success ? (
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="mx-auto mb-4 flex items-center justify-center w-16 h-16 bg-sky-600 rounded-full"
            >
              <CheckCircle className="w-8 h-8 text-sky-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Connexion réussie!</h2>
            <p className="text-gray-600 mb-6">Vous allez être redirigé vers votre tableau de bord.</p>
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <LogIn className="w-5 h-5 mr-2 text-sky-600" />
              Connexion
            </h2>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start"
              >
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
            
            <form onSubmit={handleLogin}>
              <motion.div 
                className="mb-6" 
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-sky-500 focus:border-sky-500 shadow-sm text-gray-700"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </motion.div>
              
              <motion.div 
                className="mb-7" 
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-sky-500 focus:border-sky-500 shadow-sm text-gray-700"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </motion.div>
              
              <div className="flex items-center justify-between mb-7">
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                  /> */}
                  {/* <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Se souvenir de moi
                  </label> */}
                </motion.div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center py-3 px-4 bg-sky-600 text-white font-medium rounded-lg shadow-md hover:from-sky-700 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all ${
                  isLoading ? "opacity-80 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </motion.button>
            </form>
          </div>
        )}
      </motion.div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center text-xs text-gray-500"
      >
        En vous connectant, vous acceptez notre{" "}
        <a href="#" className="text-sky-600 hover:underline">Politique de confidentialité</a>
        {" "}et nos{" "}
        <a href="#" className="text-sky-600 hover:underline">Conditions d'utilisation</a>.
      </motion.p>
    </div>
  );
}