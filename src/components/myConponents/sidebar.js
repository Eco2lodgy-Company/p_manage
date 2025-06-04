
"use client";
import React, { use, useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Folder,
  List,
  Users,
  DollarSign,
  Package,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";

const Sidebar = () => {
  const router = useRouter();
  const [entreprises, setEntreprises] = useState([
    { id: "plama", nom: "Plama" },
   
  ]);
  const [selectedEntreprise, setSelectedEntreprise] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEntrepriseName, setNewEntrepriseName] = useState("");

  const fetchEntreprises = async () => {
      try {
      const response = await fetch("http://alphatek.fr:3110/api/entreprises/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      const firmsArray = Array.isArray(data.data) ? data.data : Array.isArray(data.data[0]) ? data.data[0] : [];
      if (firmsArray.length > 0) {
        setEntreprises(firmsArray);
      } else {
        toast.warning("Aucune entreprise récupérée.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des entreprises:", error);
      toast.error("Erreur lors de la récupération des entreprises.");
    }
  }
  useEffect(() => {
    fetchEntreprises();
  }, []);

  const handleAddEntreprise = () => {
    if (!newEntrepriseName.trim()) {
      alert("Le nom de l'entreprise est requis.");
      return;
    }

    const newEntreprise = {
      value: newEntrepriseName.toLowerCase().replace(/\s+/g, ""),
      label: newEntrepriseName,
    };

    setEntreprises([...entreprises, newEntreprise]);
    setNewEntrepriseName("");
    setIsAddOpen(false);
  };

  const handleEntrepriseChange = (value) => {
    setSelectedEntreprise(value);
    // Ajoutez ici la logique pour charger les données de l'entreprise sélectionnée
    localStorage.setItem("firm", value);
    console.log(`Chargement des données pour l'entreprise : ${value}`);
  };

  return (
    <div
      className="fixed top-0 left-0 w-64 h-screen flex flex-col shadow-md"
      style={{
        backgroundColor: "var(--sidebar-bg)",
        color: "var(--header-text)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    >
      {/* Logo/Title */}
      <div
        className="p-4 flex items-center gap-2"
        style={{
          borderBottom: "1px solid var(--sidebar-border)",
        }}
      >
        <Select onValueChange={handleEntrepriseChange} value={selectedEntreprise}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Choisir une entreprise" />
          </SelectTrigger>
          <SelectContent>
            {entreprises.map((entreprise) => (
              <SelectItem key={entreprise.id} value={entreprise.id}>
                {entreprise.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="text-primary hover:text-primary/80"
              aria-label="Ajouter une nouvelle entreprise"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter une Entreprise</DialogTitle>
              <DialogDescription>
                Entrez le nom de la nouvelle entreprise.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nom-entreprise" className="text-right">
                  Nom
                </Label>
                <div className="col-span-3">
                  <Input
                    id="nom-entreprise"
                    value={newEntrepriseName}
                    onChange={(e) => setNewEntrepriseName(e.target.value)}
                    placeholder="Nom de l'entreprise"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleAddEntreprise}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => router.push("/screens/dashboard")}
              className="flex items-center w-full p-2 text-left rounded-md transition-colors"
              style={{
                color: "var(--header-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <LayoutDashboard className="w-5 h-5 mr-2" />
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push("/screens/projets")}
              className="flex items-center w-full p-2 text-left rounded-md transition-colors"
              style={{
                color: "var(--header-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Folder className="w-5 h-5 mr-2" />
              Projects
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push("/screens/taches")}
              className="flex items-center w-full p-2 text-left rounded-md transition-colors"
              style={{
                color: "var(--header-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <List className="w-5 h-5 mr-2" />
              Tasks
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push("/screens/crm")}
              className="flex items-center w-full p-2 text-left rounded-md transition-colors"
              style={{
                color: "var(--header-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Users className="w-5 h-5 mr-2" />
              CRM
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push("/screens/comptabilite")}
              className="flex items-center w-full p-2 text-left rounded-md transition-colors"
              style={{
                color: "var(--header-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Comptabilité
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push("/screens/users")}
              className="flex items-center w-full p-2 text-left rounded-md transition-colors"
              style={{
                color: "var(--header-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Users className="w-5 h-5 mr-2" />
              Ressources Humaines
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push("/screens/tools")}
              className="flex items-center w-full p-2 text-left rounded-md transition-colors"
              style={{
                color: "var(--header-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Package className="w-5 h-5 mr-2" />
              Ressources Matérielles
            </button>
          </li>
        </ul>
      </nav>

      {/* Settings and Logout Section */}
      <div className="p-4 border-t border-border">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => router.push("/settings")}
              className="flex items-center w-full p-2 text-left rounded-md transition-colors"
              style={{
                color: "var(--header-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push("/settings")} // Replace with logout route
              className="flex items-center w-full p-2 text-left rounded-md transition-colors"
              style={{
                color: "var(--header-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Se déconnecter
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
