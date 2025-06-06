"use client";
import React, { use, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Trash2, Edit, Eye, Plus ,PowerOff,Power} from "lucide-react";

export default function Users() {
  const [invites, setInvites] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    token: "",
  });

  const handleGetInvites = async () => {
    try{
      const response = await fetch(`http://alphatek.fr:3110/api/invitations/`, {
        method: "GET"
      });
      if (!response.ok) {
        throw new Error("erreur de réseau");
      }
    
       const data = await response.json();
         setInvites(data.data);
      
    }catch (error) {
      console.error("Erreur lors de la recuperation des utilisateurs:", error);
    }
  }

  useEffect(() => {
    handleGetInvites();
  }, []);

  const handleAddInvite = async() => {
    // Basic validation
    if (!formData.nom || !formData.prenom || !formData.mail || !formData.role) {
      alert("Veuillez remplir les champs obligatoires : Nom, Prénom, Email, Rôle.");
      return;
    }
    const newUser = {
      email: formData.email,
      token: formData.token,
    };

    try{
      const response = await fetch(`http://alphatek.fr:3110/api/users/add`, {
        method: "POST",
        body: JSON.stringify(newUser),
      });
      if (!response.ok) {
        throw new Error("erreur de réseau");
      }
    
       const data = await response.json();
         setUsers(data.data);
         toast.success("Utilisateur ajouté avec succès !");
      // if (data && Array.isArray(data)) {
      //   setUsers(data.data.map((user, index) => ({
      //     ...user,
      //     id: `USR${(index + 1).toString().padStart(3, "0")}`,
      //     created_at: user.created_at.split("T")[0], // Format date to YYYY-MM-DD
      //   })));
      // }
    }catch (error) {
      console.error("Erreur lors de la recuperation des utilisateurs:", error);
      toast.error("Erreur lors de l'ajout  de l\'utilisateur:", error);

    }

    setUsers([...users, newUser]);
    setFormData({
      email: "",
      token: "",
      telephone: "",
      mail: "",
      password: "",
      role: "",
    });
    setIsAddOpen(false);
  };

  const handleEditUser = async()  => {
    // Basic validation
    if (!formData.email || !formData.token || !formData.mail || !formData.role) {
      alert("Veuillez remplir les champs obligatoires : email, Préemail, Email, Rôle.");
      return;
    }

    const userToEdit = {
      id: formData.id,
      email: formData.email,
      token: formData.token,
      telephone: formData.telephone,
      mail: formData.mail,
      password: formData.password,
      role: formData.role,
      
    };

    try{
      const response = await fetch(`http://alphatek.fr:3110/api/users/edit`, {
        method: "PATCH",
        body: JSON.stringify(userToEdit),
      });
      console.log("Request body:", JSON.stringify(userToEdit));
      console.log("Response:", response);
      if (!response.ok) {
        throw new Error("erreur de réseau");
      }
    
       const data = await response.json();
         toast.success(data.message);
          setUsers(
      users.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              email: formData.email,
              token: formData.token,
            }
          : u
      )
    );
      
    }catch (error) {
      console.error("Erreur lors de la modification de l\'utilisateur:", error);
      toast.error("Erreur lors de la modification de l\'utilisateur:", error);

    }

   
    setIsEditOpen(false);
    setFormData({
      email: "",
      token: ""
    });
    setSelectedUser(null);
  };

  const handleDeleteUser = async() => {
    const userToDelete = {
      id: selectedUser.id,
    }
    try{
      const response = await fetch(`http://alphatek.fr:3110/api/invitations/delete`, {
        method: "DELETE",
        body: JSON.stringify(userToDelete),
      });
      console.log("Request body:", JSON.stringify(userToDelete));
      console.log("Response:", response);
      if (!response.ok) {
        throw new Error("erreur de réseau");
      }
    
       const data = await response.json();
         toast.success(data.message);
          setUsers(
      
    );
      
    }catch (error) {
      console.error("Erreur lors de la supression de l\'utilisateur:", error);
      toast.error("Erreur lors de la supression de l\'utilisateur:", error);

    }
    setUsers(users.filter((u) => u.id !== selectedUser.id));
    setIsDeleteOpen(false);
    setSelectedUser(null);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      telephone: user.telephone,
      mail: user.mail,
      password: "",
      role: user.role,
    });
    setIsEditOpen(true);
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setFormData({
      id: user.id,

    });
    setIsDeleteOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:ml-64 lg:ml-64 xl:ml-64">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 md:left-64 lg:left-64 xl:left-64 right-0 bg-sky-500 text-white p-4 shadow-md text-center z-10">
        <h1 className="text-2xl font-bold">Invitations</h1>
      </div>
      <Toaster />
      {/* Main content */}
      <div className="flex-1 flex flex-col p-6 pt-20">
        {/* Add User Button */}
        {/*  */}
        {/* Table Container */}
        <div className="flex-1 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="w-full h-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-sky-50">
                  <TableHead className="w-[100px] font-bold text-sky-700">
                    ID
                  </TableHead>
                  <TableHead className="font-bold text-sky-700">Email</TableHead>
                  <TableHead className="font-bold text-sky-700">
                    Token
                  </TableHead>
                  <TableHead className="text-right font-bold text-sky-700">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites && invites.length > 0 ? (
                invites.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.token}</TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                       
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditModal(user)}
                          className="text-sky-500 hover:text-sky-700"
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteModal(user)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <PowerOff className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Détails de l’Utilisateur</DialogTitle>
          <DialogDescription>
            Informations complètes sur l’utilisateur sélectionné.
          </DialogDescription>
        </DialogHeader>
        {selectedUser && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-bold">ID</Label>
              <span className="col-span-3">{selectedUser.id}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-bold">Nom</Label>
              <span className="col-span-3">{selectedUser.nom}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-bold">Prénom</Label>
              <span className="col-span-3">{selectedUser.prenom}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-bold">Téléphone</Label>
              <span className="col-span-3">{selectedUser.telephone}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-bold">Email</Label>
              <span className="col-span-3">{selectedUser.mail}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-bold">Rôle</Label>
              <span className="col-span-3">{selectedUser.role}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-bold">Date de création</Label>
              <span className="col-span-3">{selectedUser.created_at}</span>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            onClick={() => setIsViewOpen(false)}
            className="bg-sky-500 hover:bg-sky-600"
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier l’Utilisateur</DialogTitle>
            <DialogDescription>
              Mettez à jour les détails de l’utilisateur.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-nom" className="text-right">
                Nom
              </Label>
              <Input
                id="edit-nom"
                value={formData.nom}
                onChange={(e) =>
                  setFormData({ ...formData, nom: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-prenom" className="text-right">
                Prénom
              </Label>
              <Input
                id="edit-prenom"
                value={formData.prenom}
                onChange={(e) =>
                  setFormData({ ...formData, prenom: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-telephone" className="text-right">
                Téléphone
              </Label>
              <Input
                id="edit-telephone"
                type="tel"
                value={formData.telephone}
                onChange={(e) =>
                  setFormData({ ...formData, telephone: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-mail" className="text-right">
                Email
              </Label>
              <Input
                id="edit-mail"
                type="email"
                value={formData.mail}
                onChange={(e) =>
                  setFormData({ ...formData, mail: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">
                Mot de passe
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Laissez vide pour ne pas modifier"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Rôle
              </Label>
              <Input
                id="edit-role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleEditUser}
              className="bg-sky-500 hover:bg-sky-600"
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la Suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="border-sky-500 text-sky-500 hover:bg-sky-50"
            >
              Annuler
            </Button>
            <Button
              onClick={handleDeleteUser}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
  
}