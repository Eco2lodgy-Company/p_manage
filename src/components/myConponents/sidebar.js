"use client";
// Sidebar.js
import React, { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { useEntreprise } from "@/components/EntrepriseContext";

const Sidebar = () => {
  const router = useRouter();
  const { selectedEntreprise, setSelectedEntreprise } = useEntreprise();
  const [entreprises, setEntreprises] = useState([]);
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
  };

  useEffect(() => {
    fetchEntreprises();
  }, []);

  const handleAddEntreprise = async () => {
    if (!newEntrepriseName.trim()) {
      toast.error("Le nom de l'entreprise est requis.");
      return;
    }

    try {
      const response = await fetch("http://alphatek.fr:3110/api/entreprises/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: newEntrepriseName }),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      toast.success(data.message || "Entreprise ajoutée avec succès");
      await fetchEntreprises();
      setNewEntrepriseName("");
      setIsAddOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'entreprise:", error);
      toast.error("Erreur lors de l'ajout de l'entreprise");
    }
  };

  const handleEntrepriseChange = (value) => {
    setSelectedEntreprise(value);
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
          {/* ... autres éléments de navigation ... */}
        </ul>
      </nav>

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
              onClick={() => router.push("/logout")}
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