"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { User, Edit, LogOut } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function Profile() {
  const [profile, setProfile] = useState({
    nom: "",
    prenom: "",
    mail: "",
    role: "",
    joinDate: "",
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const id = localStorage.getItem("id");
        console.log("Fetching profile for ID:", id);

        if (!id) {
          throw new Error("Aucun ID utilisateur trouvé dans le localStorage");
        }

        const response = await fetch(`http://alphatek.fr:3110/api/users/byid?id=${id}`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Erreur de réseau");
        }

        const data = await response.json();
        console.log("Profile data fetched:", data);
        setProfile(data.data);
        setFormData({ name: `${data.data.nom} ${data.data.prenom}`, email: data.data.mail });
        console.log("Profile data set:", data);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer le profil.",
          variant: "destructive",
        });
      }
    };
    fetchProfile();
  }, []);

  const handleEditProfile = () => {
    setProfile({ ...profile, nom: formData.name.split(" ")[0], prenom: formData.name.split(" ")[1] || "", mail: formData.email });
    setIsEditOpen(false);
    toast({
      title: "Succès",
      description: "Profil mis à jour avec succès.",
    });
  };

  const handleChangePassword = async () => {
    try {
      const id = localStorage.getItem("id");
      if (!id) {
        throw new Error("Aucun ID utilisateur trouvé dans le localStorage");
      }

      const response = await fetch("http://alphatek.fr:3110/api/user/changePass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors du changement de mot de passe");
      }

      setIsPasswordOpen(false);
      setPasswordData({ oldPassword: "", newPassword: "" });
      toast({
        title: "Succès",
        description: result.message || "Mot de passe mis à jour avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur inconnue s'est produite.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    // Remplace par la logique de déconnexion réelle (par exemple, effacer la session, rediriger vers la page de connexion)
    localStorage.removeItem("id");
    alert("Déconnexion effectuée");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:ml-64 lg:ml-64 xl:ml-64">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 md:left-64 lg:left-64 xl:left-64 right-0 bg-sky-500 text-white p-4 shadow-md text-center z-10">
        <h1 className="text-2xl font-bold">Profil Utilisateur</h1>
      </div>
      {/* Main content */}
      <div className="flex-1 p-6 mt-16 flex flex-col items-center">
        {/* Profile Details Card */}
        <Card className="w-full max-w-4xl mb-6 border-l-4 border-sky-500 bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold text-sky-700">
              Informations Personnelles
            </CardTitle>
            <div className="flex gap-2">
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Modifier le Profil</DialogTitle>
                    <DialogDescription>
                      Mettez à jour vos informations personnelles.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nom
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleEditProfile}
                      className="bg-sky-500 hover:bg-sky-600"
                    >
                      Enregistrer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                    Changer le mot de passe
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Changer le mot de passe</DialogTitle>
                    <DialogDescription>
                      Entrez votre ancien et nouveau mot de passe.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="oldPassword" className="text-right">
                        Ancien mot de passe
                      </Label>
                      <Input
                        id="oldPassword"
                        type="password"
                        value={passwordData.oldPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, oldPassword: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="newPassword" className="text-right">
                        Nouveau mot de passe
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleChangePassword}
                      className="bg-sky-500 hover:bg-sky-600"
                    >
                      Enregistrer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-600">Nom</p>
                <p className="text-lg text-gray-800 flex items-center">
                  <User className="h-5 w-5 text-sky-500 mr-2" />
                  {profile.nom + " " + profile.prenom}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Email</p>
                <p className="text-lg text-gray-800">{profile.mail}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Rôle</p>
                <p className="text-lg text-gray-800">{profile.role}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Date d'inscription</p>
                <p className="text-lg text-gray-800">{profile.joinDate}</p>
              </div>
            </div>
            <div className="mt-6">
              <Button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}