"use client";
import React, { useState } from "react";
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
import { Trash2, Edit, Eye, Plus } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([
    {
      id: "USR001",
      nom: "Dupont",
      prenom: "Jean",
      telephone: "+33612345678",
      mail: "jean.dupont@example.com",
      password: "hashed_password_1",
      role: "Manager",
      created_at: "2023-05-01",
    },
    {
      id: "USR002",
      nom: "Leclerc",
      prenom: "Marie",
      telephone: "+33687654321",
      mail: "marie.leclerc@example.com",
      password: "hashed_password_2",
      role: "Employé",
      created_at: "2023-06-15",
    },
  ]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    mail: "",
    password: "",
    role: "",
  });

  const handleAddUser = () => {
    // Basic validation
    if (!formData.nom || !formData.prenom || !formData.mail || !formData.role) {
      alert("Veuillez remplir les champs obligatoires : Nom, Prénom, Email, Rôle.");
      return;
    }
    const newUser = {
      id: `USR${(users.length + 1).toString().padStart(3, "0")}`,
      nom: formData.nom,
      prenom: formData.prenom,
      telephone: formData.telephone,
      mail: formData.mail,
      password: formData.password || "default_hashed_password",
      role: formData.role,
      created_at: new Date().toISOString().split("T")[0],
    };
    setUsers([...users, newUser]);
    setFormData({
      nom: "",
      prenom: "",
      telephone: "",
      mail: "",
      password: "",
      role: "",
    });
    setIsAddOpen(false);
  };

  const handleEditUser = () => {
    // Basic validation
    if (!formData.nom || !formData.prenom || !formData.mail || !formData.role) {
      alert("Veuillez remplir les champs obligatoires : Nom, Prénom, Email, Rôle.");
      return;
    }
    setUsers(
      users.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              nom: formData.nom,
              prenom: formData.prenom,
              telephone: formData.telephone,
              mail: formData.mail,
              password: formData.password || u.password,
              role: formData.role,
            }
          : u
      )
    );
    setIsEditOpen(false);
    setFormData({
      nom: "",
      prenom: "",
      telephone: "",
      mail: "",
      password: "",
      role: "",
    });
    setSelectedUser(null);
  };

  const handleDeleteUser = () => {
    setUsers(users.filter((u) => u.id !== selectedUser.id));
    setIsDeleteOpen(false);
    setSelectedUser(null);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
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
    setIsDeleteOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:ml-64 lg:ml-64 xl:ml-64">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 md:left-64 lg:left-64 xl:left-64 right-0 bg-sky-500 text-white p-4 shadow-md text-center z-10">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col p-6 pt-20">
        {/* Add User Button */}
        <div className="flex justify-end mb-4">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 text-sm"
                aria-label="Ajouter un nouvel utilisateur"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un Utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter un Utilisateur</DialogTitle>
                <DialogDescription>
                  Remplissez les détails du nouvel utilisateur.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nom" className="text-right">
                    Nom
                  </Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData({ ...formData, nom: e.target.value })
                    }
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prenom" className="text-right">
                    Prénom
                  </Label>
                  <Input
                    id="prenom"
                    value={formData.prenom}
                    onChange={(e) =>
                      setFormData({ ...formData, prenom: e.target.value })
                    }
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="telephone" className="text-right">
                    Téléphone
                  </Label>
                  <Input
                    id="telephone"
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) =>
                      setFormData({ ...formData, telephone: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="mail" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="mail"
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
                  <Label htmlFor="password" className="text-right">
                    Mot de passe
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Rôle
                  </Label>
                  <Input
                    id="role"
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
                  type="submit"
                  onClick={handleAddUser}
                  className="bg-sky-500 hover:bg-sky-600"
                >
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {/* Table Container */}
        <div className="flex-1 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="w-full h-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-sky-50">
                  <TableHead className="w-[100px] font-bold text-sky-700">
                    ID
                  </TableHead>
                  <TableHead className="font-bold text-sky-700">Nom</TableHead>
                  <TableHead className="font-bold text-sky-700">
                    Prénom
                  </TableHead>
                  <TableHead className="font-bold text-sky-700">
                    Téléphone
                  </TableHead>
                  <TableHead className="font-bold text-sky-700">Email</TableHead>
                  <TableHead className="font-bold text-sky-700">Rôle</TableHead>
                  <TableHead className="font-bold text-sky-700">
                    Date de création
                  </TableHead>
                  <TableHead className="text-right font-bold text-sky-700">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.nom}</TableCell>
                    <TableCell>{user.prenom}</TableCell>
                    <TableCell>{user.telephone}</TableCell>
                    <TableCell>{user.mail}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.created_at}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openViewModal(user)}
                          className="text-sky-500 hover:text-sky-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditModal(user)}
                          className="text-sky-500 hover:text-sky-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteModal(user)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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