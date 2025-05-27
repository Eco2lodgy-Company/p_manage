"use client";
import React, { useState, useEffect } from "react";
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
import { Trash2, Edit, Eye } from "lucide-react";

// Define Zod schema for task validation
const taskSchema = z.object({
  titre: z.string().min(1, "Le titre est requis").max(100, "Le titre ne doit pas dépasser 100 caractères"),
  description: z.string().min(1, "La description est requise").max(500, "La description ne doit pas dépasser 500 caractères"),
  id_projet: z.string().optional(),
  start_date: z.string().optional().refine(
    (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
    "La date de début doit être au format YYYY-MM-DD"
  ),
  echeance: z.string().optional().refine(
    (val) => !val || /^\d+$/.test(val),
    "L'échéance doit être un nombre positif"
  ),
  precedence: z.enum(["1", "2", "3"], {
    errorMap: () => ({ message: "La précédence doit être '1', '2' ou '3'" }),
  }).optional(),
  asign_to: z.string().optional(),
});

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    id_projet: "",
    start_date: "",
    echeance: "",
    precedence: "1",
    asign_to: "",
  });
  const [errors, setErrors] = useState({});

  const fetchTasks = async () => {
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/tasks/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Erreur de réseau");
      }
      const data = await response.json();
      setTasks(data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches:", error);
      toast.error("Erreur lors de la récupération des tâches");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/users/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Erreur de réseau");
      }
      const data = await response.json();
      setUsers(data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      toast.error("Erreur lors de la récupération des utilisateurs");
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const validateForm = (data) => {
    const result = taskSchema.safeParse(data);
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

  const handleAddTask = async () => {
    if (!validateForm(formData)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    const newTask = {
      titre: formData.titre,
      description: formData.description,
      id_projet: formData.id_projet || undefined,
      start_date: formData.start_date || undefined,
      echeance: formData.echeance || undefined,
      precedence: formData.precedence || undefined,
      asign_to: formData.asign_to || undefined,
    };

    try {
      const response = await fetch(`http://alphatek.fr:3110/api/tasks/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) {
        throw new Error("Erreur de réseau");
      }
      const data = await response.json();
      setTasks(data.data);
      toast.success("Tâche ajoutée avec succès !");
      setFormData({
        titre: "",
        description: "",
        id_projet: "",
        start_date: "",
        echeance: "",
        precedence: "1",
        asign_to: "",
      });
      setIsAddOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tâche:", error);
      toast.error("Erreur lors de l'ajout de la tâche");
    }
  };

  const handleEditTask = async () => {
    if (!validateForm(formData)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    const taskToEdit = {
      id: formData.id,
      titre: formData.titre,
      description: formData.description,
      id_projet: formData.id_projet || undefined,
      start_date: formData.start_date || undefined,
      echeance: formData.echeance || undefined,
      precedence: formData.precedence || undefined,
      asign_to: formData.asign_to || undefined,
    };

    try {
      const response = await fetch(`http://alphatek.fr:3110/api/tasks/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskToEdit),
      });
      if (!response.ok) {
        throw new Error("Erreur de réseau");
      }
      const data = await response.json();
      toast.success(data.message);
      await fetchTasks();
      setIsEditOpen(false);
      setFormData({
        titre: "",
        description: "",
        id_projet: "",
        start_date: "",
        echeance: "",
        precedence: "1",
        asign_to: "",
      });
      setSelectedTask(null);
    } catch (error) {
      console.error("Erreur lors de la modification de la tâche:", error);
      toast.error("Erreur lors de la modification de la tâche");
    }
  };

  const handleDeleteTask = async () => {
    const taskToDelete = { id: selectedTask.id };
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/tasks/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskToDelete),
      });
      if (!response.ok) {
        throw new Error("Erreur de réseau");
      }
      const data = await response.json();
      toast.success(data.message);
      await fetchTasks();
      setIsDeleteOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche:", error);
      toast.error("Erreur lors de la suppression de la tâche");
    }
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setFormData({
      id: task.id,
      titre: task.titre,
      description: task.description,
      id_projet: task.id_projet || "",
      start_date: task.start_date || "",
      echeance: task.echeance || "",
      precedence: task.precedence || "1",
      asign_to: task.asign_to || "",
    });
    setErrors({});
    setIsEditOpen(true);
  };

  const openViewModal = (task) => {
    setSelectedTask(task);
    setIsViewOpen(true);
  };

  const openDeleteModal = (task) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:ml-64 lg:ml-64 xl:ml-64">
      <Toaster />
      <div className="fixed top-0 left-0 md:left-64 lg:left-64 xl:left-64 right-0 bg-sky-500 text-white p-4 shadow-md text-center z-10">
        <h1 className="text-2xl font-bold">Tâches</h1>
      </div>
      <div className="flex-1 flex flex-col p-6 pt-20">
        <div className="flex justify-end mb-4">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                Ajouter une Tâche
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter une Tâche</DialogTitle>
                <DialogDescription>
                  Remplissez les détails de la nouvelle tâche.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="titre" className="text-right">
                    Titre
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="titre"
                      value={formData.titre}
                      onChange={(e) =>
                        setFormData({ ...formData, titre: e.target.value })
                      }
                      className={errors.titre ? "border-red-500" : ""}
                    />
                    {errors.titre && <p className="text-red-500 text-sm mt-1">{errors.titre}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="id_projet" className="text-right">
                    Projet
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="id_projet"
                      value={formData.id_projet}
                      onChange={(e) =>
                        setFormData({ ...formData, id_projet: e.target.value })
                      }
                      className={errors.id_projet ? "border-red-500" : ""}
                    />
                    {errors.id_projet && <p className="text-red-500 text-sm mt-1">{errors.id_projet}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start_date" className="text-right">
                    Date de début
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      className={errors.start_date ? "border-red-500" : ""}
                    />
                    {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="echeance" className="text-right">
                    Échéance
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="echeance"
                      type="number"
                      value={formData.echeance}
                      onChange={(e) =>
                        setFormData({ ...formData, echeance: e.target.value })
                      }
                      className={errors.echeance ? "border-red-500" : ""}
                    />
                    {errors.echeance && <p className="text-red-500 text-sm mt-1">{errors.echeance}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="precedence" className="text-right">
                    Précédence
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={formData.precedence}
                      onValueChange={(value) =>
                        setFormData({ ...formData, precedence: value })
                      }
                    >
                      <SelectTrigger className={errors.precedence ? "border-red-500" : ""}>
                        <SelectValue placeholder="Choisir une précédence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Basse (1)</SelectItem>
                        <SelectItem value="2">Moyenne (2)</SelectItem>
                        <SelectItem value="3">Haute (3)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.precedence && <p className="text-red-500 text-sm mt-1">{errors.precedence}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="asign_to" className="text-right">
                    Assignée à
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={formData.asign_to}
                      onValueChange={(value) =>
                        setFormData({ ...formData, asign_to: value })
                      }
                    >
                      <SelectTrigger className={errors.asign_to ? "border-red-500" : ""}>
                        <SelectValue placeholder="Choisir un utilisateur" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.nom} {user.prenom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.asign_to && <p className="text-red-500 text-sm mt-1">{errors.asign_to}</p>}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleAddTask}
                  className="bg-sky-500 hover:bg-sky-600"
                >
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex-1 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="w-full h-full overflow-auto">
            <Table className="">
              <TableHeader>
                <TableRow className="bg-sky-50">
                  <TableHead className="w-[100px] font-bold text-sky-700">ID</TableHead>
                  <TableHead className="font-bold text-sky-700">Titre</TableHead>
                  <TableHead className="font-bold text-sky-700">Description</TableHead>
                  <TableHead className="font-bold text-sky-700">Projet</TableHead>
                  <TableHead className="font-bold text-sky-700">Date de début</TableHead>
                  <TableHead className="font-bold text-sky-700">Échéance</TableHead>
                  <TableHead className="font-bold text-sky-700">Précédence</TableHead>
                  <TableHead className="font-bold text-sky-700">Assignée à</TableHead>
                  <TableHead className="text-right font-bold text-sky-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks && tasks.length > 0 ? (
                  tasks.map((task) => (
                    <TableRow
                      key={task.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium">{task.id}</TableCell>
                      <TableCell>{task.titre}</TableCell>
                      <TableCell>{task.description}</TableCell>
                      <TableCell>{task.id_projet || "aucun"}</TableCell>
                      <TableCell>{task.start_date || "-"}</TableCell>
                      <TableCell>{task.echeance || "0"}</TableCell>
                      <TableCell>{task.precedence || "-"}</TableCell>
                      <TableCell>{users.find(u => u.id === task.asign_to)?.nom || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openViewModal(task)}
                            className="text-sky-500 hover:text-sky-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditModal(task)}
                            className="text-sky-500 hover:text-sky-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openDeleteModal(task)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      Aucune tâche trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Détails de la Tâche</DialogTitle>
            <DialogDescription>
              Informations complètes sur la tâche sélectionnée.
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">ID</Label>
                <span className="col-span-3">{selectedTask.id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Titre</Label>
                <span className="col-span-3">{selectedTask.titre}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Description</Label>
                <span className="col-span-3">{selectedTask.description}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Projet</Label>
                <span className="col-span-3">{selectedTask.id_projet || "aucun"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Date de début</Label>
                <span className="col-span-3">{selectedTask.start_date || "-"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Échéance</Label>
                <span className="col-span-3">{selectedTask.echeance || "0"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Précédence</Label>
                <span className="col-span-3">{selectedTask.precedence || "-"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Assignée à</Label>
                <span className="col-span-3">{users.find(u => u.id === selectedTask.asign_to)?.nom || "-"}</span>
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

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier la Tâche</DialogTitle>
            <DialogDescription>
              Mettez à jour les détails de la tâche.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-titre" className="text-right">
                Titre
              </Label>
              <div className="col-span-3">
                <Input
                  id="edit-titre"
                  value={formData.titre}
                  onChange={(e) =>
                    setFormData({ ...formData, titre: e.target.value })
                  }
                  className={errors.titre ? "border-red-500" : ""}
                />
                {errors.titre && <p className="text-red-500 text-sm mt-1">{errors.titre}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <div className="col-span-3">
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-id_projet" className="text-right">
                Projet
              </Label>
              <div className="col-span-3">
                <Input
                  id="edit-id_projet"
                  value={formData.id_projet}
                  onChange={(e) =>
                    setFormData({ ...formData, id_projet: e.target.value })
                  }
                  className={errors.id_projet ? "border-red-500" : ""}
                />
                {errors.id_projet && <p className="text-red-500 text-sm mt-1">{errors.id_projet}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-start_date" className="text-right">
                Date de début
              </Label>
              <div className="col-span-3">
                <Input
                  id="edit-start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className={errors.start_date ? "border-red-500" : ""}
                />
                {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-echeance" className="text-right">
                Échéance
              </Label>
              <div className="col-span-3">
                <Input
                  id="edit-echeance"
                  type="number"
                  value={formData.echeance}
                  onChange={(e) =>
                    setFormData({ ...formData, echeance: e.target.value })
                  }
                  className={errors.echeance ? "border-red-500" : ""}
                />
                {errors.echeance && <p className="text-red-500 text-sm mt-1">{errors.echeance}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-precedence" className="text-right">
                Précédence
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.precedence}
                  onValueChange={(value) =>
                    setFormData({ ...formData, precedence: value })
                  }
                >
                  <SelectTrigger className={errors.precedence ? "border-red-500" : ""}>
                    <SelectValue placeholder="Choisir une précédence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Basse (1)</SelectItem>
                    <SelectItem value="2">Moyenne (2)</SelectItem>
                    <SelectItem value="3">Haute (3)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.precedence && <p className="text-red-500 text-sm mt-1">{errors.precedence}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-asign_to" className="text-right">
                Assignée à
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.asign_to}
                  onValueChange={(value) =>
                    setFormData({ ...formData, asign_to: value })
                  }
                >
                  <SelectTrigger className={errors.asign_to ? "border-red-500" : ""}>
                    <SelectValue placeholder="Choisir un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.nom} {user.prenom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.asign_to && <p className="text-red-500 text-sm mt-1">{errors.asign_to}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleEditTask}
              className="bg-sky-500 hover:bg-sky-600"
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la Suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.
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
              onClick={handleDeleteTask}
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