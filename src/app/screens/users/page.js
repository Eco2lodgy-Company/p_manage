
"use client";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Trash2, Edit, Eye, Plus, ArrowLeft } from "lucide-react";

// Define Zod schema for user validation
const userSchema = z.object({
  nom: z.string().min(1, "Le nom est requis").max(50, "Le nom ne doit pas dépasser 50 caractères"),
  prenom: z.string().min(1, "Le prénom est requis").max(50, "Le prénom ne doit pas dépasser 50 caractères"),
  telephone: z.string().optional().refine(
    (val) => !val || /^[0-9]{8}$/.test(val),
    "Le numéro de téléphone doit contenir exactement 10 chiffres"
  ),
  mail: z.string().email("L'email doit être valide").min(1, "L'email est requis"),
  password: z.string().optional().refine(
    (val) => !val || val.length >= 8,
    "Le mot de passe doit contenir au moins 8 caractères"
  ),
  role: z.enum(["admin", "user", "guest"], {
    errorMap: () => ({ message: "Le rôle doit être 'admin', 'user' ou 'guest'" }),
  }),
});

export default function Users() {
  const [users, setUsers] = useState([]);
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
  const [errors, setErrors] = useState({});

  const handleGetUsers = async () => {
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/users/`, {
        method: "GET",
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      setUsers(data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      toast.error("Erreur lors de la récupération des utilisateurs");
    }
  };

  useEffect(() => {
    handleGetUsers();
  }, []);

  const validateForm = (data) => {
    const result = userSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0];
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleAddUser = async () => {
    if (!validateForm(formData)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
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

    try {
      const response = await fetch(`http://alphatek.fr:3110/api/users/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      setUsers(data.data);
      toast.success("Utilisateur ajouté avec succès !");
      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        mail: "",
        password: "",
        role: "",
      });
      setIsAddOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'utilisateur:", error);
      toast.error("Erreur lors de l'ajout de l'utilisateur");
    }
  };

  const handleEditUser = async () => {
    if (!validateForm(formData)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    const userToEdit = {
      id: formData.id,
      nom: formData.nom,
      prenom: formData.prenom,
      telephone: formData.telephone,
      mail: formData.mail,
      password: formData.password,
      role: formData.role,
    };

    try {
      const response = await fetch(`http://alphatek.fr:3110/api/users/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userToEdit),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      toast.success(data.message);
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
    } catch (error) {
      console.error("Erreur lors de la modification de l'utilisateur:", error);
      toast.error("Erreur lors de la modification de l'utilisateur");
    }
  };

  const handleDeleteUser = async () => {
    const userToDelete = { id: selectedUser.id };
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/users/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userToDelete),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      toast.success(data.message);
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setIsDeleteOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      toast.error("Erreur lors de la suppression de l'utilisateur");
    }
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
    setErrors({});
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
    <div className="min-h-screen bg-background p-6 md:ml-64 lg:ml-64 xl:ml-64">
      <div className="max-w-7xl mx-auto">
        <Toaster />
        {/* En-tête */}
        <div className="fixed top-0 left-0 md:left-64 lg:left-64 xl:left-64 right-0 bg-background text-white p-4 shadow-md flex justify-between items-center z-10">
          <button
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <div className="flex items-center gap-2">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2"
                  aria-label="Ajouter un nouvel utilisateur"
                >
                  <Plus className="w-4 h-4" />
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
                    <div className="col-span-3">
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) =>
                          setFormData({ ...formData, nom: e.target.value })
                        }
                        className={errors.nom ? "border-destructive" : ""}
                      />
                      {errors.nom && <p className="text-destructive text-sm mt-1">{errors.nom}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="prenom" className="text-right">
                      Prénom
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="prenom"
                        value={formData.prenom}
                        onChange={(e) =>
                          setFormData({ ...formData, prenom: e.target.value })
                        }
                        className={errors.prenom ? "border-destructive" : ""}
                      />
                      {errors.prenom && <p className="text-destructive text-sm mt-1">{errors.prenom}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="telephone" className="text-right">
                      Téléphone
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="telephone"
                        type="tel"
                        value={formData.telephone}
                        onChange={(e) =>
                          setFormData({ ...formData, telephone: e.target.value })
                        }
                        className={errors.telephone ? "border-destructive" : ""}
                      />
                      {errors.telephone && <p className="text-destructive text-sm mt-1">{errors.telephone}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mail" className="text-right">
                      Email
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="mail"
                        type="email"
                        value={formData.mail}
                        onChange={(e) =>
                          setFormData({ ...formData, mail: e.target.value })
                        }
                        className={errors.mail ? "border-destructive" : ""}
                      />
                      {errors.mail && <p className="text-destructive text-sm mt-1">{errors.mail}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Mot de passe
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className={errors.password ? "border-destructive" : ""}
                      />
                      {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Rôle
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={formData.role}
                        onValueChange={(value) =>
                          setFormData({ ...formData, role: value })
                        }
                      >
                        <SelectTrigger className={errors.role ? "border-destructive" : ""}>
                          <SelectValue placeholder="Choisir un rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrateur</SelectItem>
                          <SelectItem value="user">Employé(e)</SelectItem>
                          <SelectItem value="guest">Invité</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.role && <p className="text-destructive text-sm mt-1">{errors.role}</p>}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleAddUser}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Ajouter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="mt-8 bg-card border border-border rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Liste des Utilisateurs</h2>
          </div>
          <div className="p-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="w-[100px] font-semibold text-foreground">ID</TableHead>
                  <TableHead className="font-semibold text-foreground">Nom</TableHead>
                  <TableHead className="font-semibold text-foreground">Prénom</TableHead>
                  <TableHead className="font-semibold text-foreground">Téléphone</TableHead>
                  <TableHead className="font-semibold text-foreground">Email</TableHead>
                  <TableHead className="font-semibold text-foreground">Rôle</TableHead>
                  <TableHead className="font-semibold text-foreground">Date de création</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">{user.id}</TableCell>
                      <TableCell className="text-foreground">{user.nom}</TableCell>
                      <TableCell className="text-foreground">{user.prenom}</TableCell>
                      <TableCell className="text-foreground">{user.telephone}</TableCell>
                      <TableCell className="text-foreground">{user.mail}</TableCell>
                      <TableCell className="text-foreground">{user.role}</TableCell>
                      <TableCell className="text-foreground">{user.created_at}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openViewModal(user)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditModal(user)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openDeleteModal(user)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Modal de visualisation */}
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
                  <Label className="text-right font-medium text-muted-foreground">ID</Label>
                  <span className="col-span-3 text-foreground">{selectedUser.id}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">Nom</Label>
                  <span className="col-span-3 text-foreground">{selectedUser.nom}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">Prénom</Label>
                  <span className="col-span-3 text-foreground">{selectedUser.prenom}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">Téléphone</Label>
                  <span className="col-span-3 text-foreground">{selectedUser.telephone}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">Email</Label>
                  <span className="col-span-3 text-foreground">{selectedUser.mail}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">Rôle</Label>
                  <span className="col-span-3 text-foreground">{selectedUser.role}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">Date de création</Label>
                  <span className="col-span-3 text-foreground">{selectedUser.created_at}</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => setIsViewOpen(false)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de modification */}
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
                <div className="col-span-3">
                  <Input
                    id="edit-nom"
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData({ ...formData, nom: e.target.value })
                    }
                    className={errors.nom ? "border-destructive" : ""}
                  />
                  {errors.nom && <p className="text-destructive text-sm mt-1">{errors.nom}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-prenom" className="text-right">
                  Prénom
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-prenom"
                    value={formData.prenom}
                    onChange={(e) =>
                      setFormData({ ...formData, prenom: e.target.value })
                    }
                    className={errors.prenom ? "border-destructive" : ""}
                  />
                  {errors.prenom && <p className="text-destructive text-sm mt-1">{errors.prenom}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-telephone" className="text-right">
                  Téléphone
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-telephone"
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) =>
                      setFormData({ ...formData, telephone: e.target.value })
                    }
                    className={errors.telephone ? "border-destructive" : ""}
                  />
                  {errors.telephone && <p className="text-destructive text-sm mt-1">{errors.telephone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-mail" className="text-right">
                  Email
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-mail"
                    type="email"
                    value={formData.mail}
                    onChange={(e) =>
                      setFormData({ ...formData, mail: e.target.value })
                    }
                    className={errors.mail ? "border-destructive" : ""}
                  />
                  {errors.mail && <p className="text-destructive text-sm mt-1">{errors.mail}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-password" className="text-right">
                  Mot de passe
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Laissez vide pour ne pas modifier"
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Rôle
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger className={errors.role ? "border-destructive" : ""}>
                      <SelectValue placeholder="Choisir un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="user">Employé(e)</SelectItem>
                      <SelectItem value="guest">Invité</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-destructive text-sm mt-1">{errors.role}</p>}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleEditUser}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de suppression */}
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
                className="border-primary text-primary hover:bg-primary/10"
              >
                Annuler
              </Button>
              <Button
                onClick={handleDeleteUser}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
