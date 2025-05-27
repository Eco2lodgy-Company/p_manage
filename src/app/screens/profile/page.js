"use client";
import React, { useState,useEffect } from "react";
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

// Sample user data (replace with API call)
const userData = {
  nom: "Jean Dupont",
  prenom: "Jean Dupont",
  mail: "jean.dupont@example.com",
  role: "Manager",
  joinDate: "2023-05-01",
  // tasks: [
  //   {
  //     id: "T001",
  //     nom: "Foundation Work",
  //     project: "Project Alpha",
  //     status: "Terminée",
  //     dueDate: "2024-02-15",
  //   },
  //   {
  //     id: "T002",
  //     name: "Structural Framing",
  //     project: "Project Beta",
  //     status: "En Cours",
  //     dueDate: "2024-04-01",
  //   },
  // ],
  // projects: [
  //   { id: "INV001", title: "Project Alpha", status: "En Cours" },
  //   { id: "INV002", title: "Project Beta", status: "Terminée" },
  // ],
};


export default function Profile() {
  const [profile, setProfile] = useState(userData);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({ name: profile.name, email: profile.email });
// useEffect(() => {
//   const id = localStorage.getItem("id");
//       console.log("Fetching profile for ID:", id);

// })
  useEffect(() => {
    // Retrieve data from local storage
    // if (id) {
    //   setData(storedData);
    // }

     const fetchProfile = async () => {
    try{
    const id = localStorage.getItem("id");
      console.log("Fetching profile for ID:", id);

      const response = await fetch(`http://alphatek.fr:3110/api/users/byid?id=${id}`, {
          method: "GET",
        });
         if (!response.ok) {
                  throw new Error("Erreur de réseau");
                }
                const data = await response.json();
                console.log("Profile data fetched:", data);
                setProfile(data.data);
                setFormData({ name: data.name, email: data.email });
                console.log("Profile data set:", data);
    }catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
    }
  }
  fetchProfile();
  }, []);


  const fetchProfile = async () => {
    try{

      const response = await fetch(`http://alphatek.fr:3110/api/users/byid?id=${id}`, {
          method: "GET",
        });
    }catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
    }
  }

  const handleEditProfile = () => {
    setProfile({ ...profile, name: formData.name, email: formData.email });
    setIsEditOpen(false);
    setFormData({ name: formData.name, email: formData.email });
  };

  const handleLogout = () => {
    // Replace with actual logout logic (e.g., clear session, redirect to login)
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

        {/* Tasks Summary */}
        {/* <Card className="w-full max-w-4xl mb-6 bg-white shadow-md border-l-4 border-sky-500">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-sky-700">
              Résumé des Tâches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-sky-50">
                    <TableHead className="font-bold text-sky-700">ID</TableHead>
                    <TableHead className="font-bold text-sky-700">Tâche</TableHead>
                    <TableHead className="font-bold text-sky-700">Projet</TableHead>
                    <TableHead className="font-bold text-sky-700">Statut</TableHead>
                    <TableHead className="font-bold text-sky-700">Date d'échéance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profile.tasks.map((task) => (
                    <TableRow
                      key={task.id}
                      className="hover:bg-sky-100 transition-colors"
                    >
                      <TableCell>{task.id}</TableCell>
                      <TableCell>{task.name}</TableCell>
                      <TableCell>{task.project}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-white text-sm ${
                            task.status === "Terminée"
                              ? "bg-green-500"
                              : task.status === "En Cours"
                              ? "bg-yellow-500"
                              : "bg-orange-500"
                          }`}
                        >
                          {task.status}
                        </span>
                      </TableCell>
                      <TableCell>{task.dueDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card> */}

        {/* Projects Summary */}
        {/* <Card className="w-full max-w-4xl bg-white shadow-md border-l-4 border-sky-500">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-sky-700">
              Résumé des Projets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-sky-50">
                    <TableHead className="font-bold text-sky-700">ID</TableHead>
                    <TableHead className="font-bold text-sky-700">Titre</TableHead>
                    <TableHead className="font-bold text-sky-700">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profile.projects.map((project) => (
                    <TableRow
                      key={project.id}
                      className="hover:bg-sky-100 transition-colors"
                    >
                      <TableCell>{project.id}</TableCell>
                      <TableCell>{project.title}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-white text-sm ${
                            project.status === "Terminée"
                              ? "bg-green-500"
                              : project.status === "En Cours"
                              ? "bg-yellow-500"
                              : "bg-orange-500"
                          }`}
                        >
                          {project.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}