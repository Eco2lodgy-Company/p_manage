"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster, toast } from "sonner";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://alphatek.fr:3110/api/tasks";

const TaskForm = ({ formData, setFormData, onSubmit, submitLabel }) => (
  <div className="grid gap-4 py-4">
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="title" className="text-right">Titre</Label>
      <Input
        id="title"
        value={formData.titre}
        onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
        className="col-span-3"
        required
      />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="description" className="text-right">Description</Label>
      <Input
        id="description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="col-span-3"
        required
      />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="startDate" className="text-right">Date de début</Label>
      <Input
        id="startDate"
        type="date"
        value={formData.start_date}
        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
        className="col-span-3"
      />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="endDate" className="text-right">Échéance</Label>
      <Input
        id="endDate"
        type="date"
        value={formData.echeance}
        onChange={(e) => setFormData({ ...formData, echeance: e.target.value })}
        className="col-span-3"
      />
    </div>
    <DialogFooter>
      <Button onClick={onSubmit} className="bg-sky-500 hover:bg-sky-600">{submitLabel}</Button>
    </DialogFooter>
  </div>
);

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    id_projet: "",
    start_date: "",
    echeance: "",
    precedence: "",
    asign_to: "",
  });

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();
      if (!data.data) throw new Error("Format de réponse inattendu");
      setTasks(data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const validateForm = (data) => {
    if (!data.titre || !data.description) {
      toast.error("Veuillez remplir les champs obligatoires : Titre, Description");
      return false;
    }
    if (data.start_date && data.echeance && new Date(data.start_date) > new Date(data.echeance)) {
      toast.error("La date de début doit être antérieure à l'échéance");
      return false;
    }
    return true;
  };

  const handleAddTask = async () => {
    if (!validateForm(formData)) return;
    setIsLoading(true);
    try {
      const newTask = {
        titre: formData.titre,
        description: formData.description,
        start_date: formData.start_date,
        echeance: formData.echeance,
      };
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();
      toast.success("Tâche ajoutée avec succès !");
      await fetchTasks();
      setFormData({ titre: "", description: "", id_projet: "", start_date: "", echeance: "", precedence: "", asign_to: "" });
      setIsAddOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tâche:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTask = async () => {
    if (!validateForm(formData)) return;
    setIsLoading(true);
    try {
      const taskToEdit = {
        id: formData.id,
        titre: formData.titre,
        description: formData.description,
        start_date: formData.start_date,
        echeance: formData.echeance,
        asign_to: formData.asign_to,
      };
      const response = await fetch(`${API_BASE_URL}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskToEdit),
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();
      toast.success(data.message || "Tâche modifiée avec succès !");
      await fetchTasks();
      setIsEditOpen(false);
      setFormData({ titre: "", description: "", id_projet: "", start_date: "", echeance: "", precedence: "", asign_to: "" });
      setSelectedTask(null);
    } catch (error) {
      console.error("Erreur lors de la modification de la tâche:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/delete?id=${selectedTask.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();
      toast.success(data.message || "Tâche supprimée avec succès !");
      await fetchTasks();
      setIsDeleteOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
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
      precedence: task.precedence || "",
      asign_to: task.asign_to || "",
    });
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
              <Button className="bg-sky-500 hover:bg-sky-600 text-white" disabled={isLoading}>
                Ajouter une Tâche
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter une Tâche</DialogTitle>
                <DialogDescription>Remplissez les détails de la nouvelle tâche.</DialogDescription>
              </DialogHeader>
              <TaskForm formData={formData} setFormData={setFormData} onSubmit={handleAddTask} submitLabel="Ajouter" />
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex-1 bg-white shadow-md rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center">Chargement...</div>
          ) : (
            <div className="w-full h-full overflow-auto">
              <Table>
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
                  {tasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium">{task.id}</TableCell>
                      <TableCell>{task.titre}</TableCell>
                      <TableCell>{task.description}</TableCell>
                      <TableCell>{task.id_projet || ""}</TableCell>
                      <TableCell>{task.start_date}</TableCell>
                      <TableCell>{task.echeance}</TableCell>
                      <TableCell>{task.precedence || ""}</TableCell>
                      <TableCell>{task.asign_to || ""}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openViewModal(task)}
                            className="text-sky-500 hover:text-sky-700"
                            disabled={isLoading}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditModal(task)}
                            className="text-sky-500 hover:text-sky-700"
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openDeleteModal(task)}
                            className="text-red-500 hover:text-red-700"
                            disabled={isLoading}
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
          )}
        </div>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Détails de la Tâche</DialogTitle>
            <DialogDescription>Informations complètes sur la tâche sélectionnée.</DialogDescription>
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
                <span className="col-span-3">{selectedTask.id_projet || ""}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Date de début</Label>
                <span className="col-span-3">{selectedTask.start_date}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Échéance</Label>
                <span className="col-span-3">{selectedTask.echeance}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Précédence</Label>
                <span className="col-span-3">{selectedTask.precedence || ""}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Assignée à</Label>
                <span className="col-span-3">{selectedTask.asign_to || ""}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)} className="bg-sky-500 hover:bg-sky-600">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier la Tâche</DialogTitle>
            <DialogDescription>Mettez à jour les détails de la tâche.</DialogDescription>
          </DialogHeader>
          <TaskForm formData={formData} setFormData={setFormData} onSubmit={handleEditTask} submitLabel="Enregistrer" />
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
              disabled={isLoading}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}