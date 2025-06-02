
"use client";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
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
import { Trash2, Edit, Eye, Plus, ArrowLeft, Search } from "lucide-react";

// Define Zod schema for client validation
const clientSchema = z.object({
  nom: z.string().min(1, "Le nom est requis").max(50, "Le nom ne doit pas dépasser 50 caractères"),
  prenom: z.string().min(1, "Le prénom est requis").max(50, "Le prénom ne doit pas dépasser 50 caractères"),
  telephone: z.string().optional().refine(
    (val) => !val || /^[0-9]{8}$/.test(val),
    "Le numéro de téléphone doit contenir exactement 10 chiffres"
  ),
  email: z.string().email("L'email doit être valide").min(1, "L'email est requis"),
  societe: z.string().max(100, "La société ne doit pas dépasser 100 caractères").optional(),
  statut: z.enum(["prospect", "client_actif", "inactif"], {
    errorMap: () => ({ message: "Le statut doit être 'prospect', 'client_actif' ou 'inactif'" }),
  }),
  notes: z.string().optional(),
});

export default function Clients() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    societe: "",
    statut: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});

  const handleGetClients = async () => {
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/clients/`, {
        method: "GET",
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      setClients(data.data || []);
      setFilteredClients(data.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des clients:", error);
      toast.error("Erreur lors de la récupération des clients");
    }
  };

  useEffect(() => {
    handleGetClients();
  }, []);

  useEffect(() => {
    const filtered = clients.filter(
      (client) =>
        client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const validateForm = (data) => {
    const result = clientSchema.safeParse(data);
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

  const handleAddClient = async () => {
    if (!validateForm(formData)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    const newClient = {
      id: `CLI${(clients.length + 1).toString().padStart(3, "0")}`,
      nom: formData.nom,
      prenom: formData.prenom,
      telephone: formData.telephone,
      email: formData.email,
      societe: formData.societe,
      statut: formData.statut,
      notes: formData.notes,
      created_at: new Date().toISOString().split("T")[0],
    };

    try {
      const response = await fetch(`http://alphatek.fr:3110/api/clients/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      setClients(data.data || []);
      setFilteredClients(data.data || []);
      toast.success("Client ajouté avec succès !");
      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        email: "",
        societe: "",
        statut: "",
        notes: "",
      });
      setIsAddOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout du client:", error);
      toast.error("Erreur lors de l'ajout du client");
    }
  };

  const handleEditClient = async () => {
    if (!validateForm(formData)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    const clientToEdit = {
      id: formData.id,
      nom: formData.nom,
      prenom: formData.prenom,
      telephone: formData.telephone,
      email: formData.email,
      societe: formData.societe,
      statut: formData.statut,
      notes: formData.notes,
    };

    try {
      const response = await fetch(`http://alphatek.fr:3110/api/clients/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientToEdit),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      toast.success(data.message);
      setClients(
        clients.map((c) =>
          c.id === selectedClient.id
            ? {
                ...c,
                nom: formData.nom,
                prenom: formData.prenom,
                telephone: formData.telephone,
                email: formData.email,
                societe: formData.societe,
                statut: formData.statut,
                notes: formData.notes,
              }
            : c
        )
      );
      setFilteredClients(
        filteredClients.map((c) =>
          c.id === selectedClient.id
            ? {
                ...c,
                nom: formData.nom,
                prenom: formData.prenom,
                telephone: formData.telephone,
                email: formData.email,
                societe: formData.societe,
                statut: formData.statut,
                notes: formData.notes,
              }
            : c
        )
      );
      setIsEditOpen(false);
      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        email: "",
        societe: "",
        statut: "",
        notes: "",
      });
      setSelectedClient(null);
    } catch (error) {
      console.error("Erreur lors de la modification du client:", error);
      toast.error("Erreur lors de la modification du client");
    }
  };

  const handleDeleteClient = async () => {
    const clientToDelete = { id: selectedClient.id };
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/clients/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientToDelete),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      toast.success(data.message);
      setClients(clients.filter((c) => c.id !== selectedClient.id));
      setFilteredClients(filteredClients.filter((c) => c.id !== selectedClient.id));
      setIsDeleteOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.error("Erreur lors de la suppression du client:", error);
      toast.error("Erreur lors de la suppression du client");
    }
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setFormData({
      id: client.id,
      nom: client.nom,
      prenom: client.prenom,
      telephone: client.telephone,
      email: client.email,
      societe: client.societe,
      statut: client.statut,
      notes: client.notes,
    });
    setErrors({});
    setIsEditOpen(true);
  };

  const openViewModal = (client) => {
    setSelectedClient(client);
    setIsViewOpen(true);
  };

  const openDeleteModal = (client) => {
    setSelectedClient(client);
    setIsDeleteOpen(true);
  };
  const formattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6 md:ml-64 lg:ml-64 xl:ml-64">
      <div className="max-w-7xl mx-auto">
        <Toaster />
        {/* En-tête */}
        <div className="fixed top-0 left-0 md:left-64 lg:left-64 xl:left-64 right-0 bg-background text-white p-4 shadow-md flex justify-between items-center z-10">
          <button
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => router.back()} // Remplacez par la route souhaitée
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold">Gestion des Clients</h1>
          <div className="flex items-center gap-2">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2"
                  aria-label="Ajouter un nouveau client"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un Client
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Ajouter un Client</DialogTitle>
                  <DialogDescription>
                    Remplissez les détails du nouveau client.
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
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="societe" className="text-right">
                      Société
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="societe"
                        value={formData.societe}
                        onChange={(e) =>
                          setFormData({ ...formData, societe: e.target.value })
                        }
                        className={errors.societe ? "border-destructive" : ""}
                      />
                      {errors.societe && <p className="text-destructive text-sm mt-1">{errors.societe}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="statut" className="text-right">
                      Statut
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={formData.statut}
                        onValueChange={(value) =>
                          setFormData({ ...formData, statut: value })
                        }
                      >
                        <SelectTrigger className={errors.statut ? "border-destructive" : ""}>
                          <SelectValue placeholder="Choisir un statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prospect">Prospect</SelectItem>
                          <SelectItem value="client_actif">Client Actif</SelectItem>
                          <SelectItem value="inactif">Inactif</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.statut && <p className="text-destructive text-sm mt-1">{errors.statut}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        className={errors.notes ? "border-destructive" : ""}
                      />
                      {errors.notes && <p className="text-destructive text-sm mt-1">{errors.notes}</p>}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleAddClient}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Ajouter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Recherche */}
        <div className="mt-18 mb-4 flex items-center gap-4">
          <div className="relative w-64">
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Tableau des clients */}
        <div className="bg-card border border-border rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Liste des Clients</h2>
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
                  <TableHead className="font-semibold text-foreground">Societé</TableHead>
                  <TableHead className="font-semibold text-foreground">Statut</TableHead>
                  <TableHead className="font-semibold text-foreground">Date de création</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients && filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow
                      key={client.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">{client.id}</TableCell>
                      <TableCell className="text-foreground">{client.nom}</TableCell>
                      <TableCell className="text-foreground">{client.prenom}</TableCell>
                      <TableCell className="text-foreground">{client.telephone}</TableCell>
                      <TableCell className="text-foreground">{client.email}</TableCell>
                      <TableCell className="text-foreground">{client.societe}</TableCell>
                      <TableCell className="text-foreground">{client.statut}</TableCell>
                      <TableCell className="text-foreground">{formattedDate(client.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openViewModal(client)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditModal(client)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openDeleteModal(client)}
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
                      Aucun client trouvé
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
              <DialogTitle>Détails du Client</DialogTitle>
              <DialogDescription>
                Informations complètes sur le client sélectionné.
              </DialogDescription>
            </DialogHeader>
            {selectedClient && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">ID</Label>
                  <span className="col-span-3 text-foreground">{selectedClient.id}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">Nom</Label>
                  <span className="col-span-3 text-foreground">{selectedClient.nom}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">Prénom</Label>
                  <span className="col-span-3 text-foreground">{selectedClient.prenom}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">Téléphone</Label>
                  <span className="col-span-3 text-foreground">{selectedClient.telephone}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">Email</Label>
                  <span className="col-span-3 text-foreground">{selectedClient.email}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">Société</Label>
                  <span className="col-span-3 text-foreground">{selectedClient.societe || "N/A"}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">Statut</Label>
                  <span className="col-span-3 text-foreground">{selectedClient.statut}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">Notes</Label>
                  <span className="col-span-3 text-foreground">{selectedClient.notes || "Aucune note"}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">Date de création</Label>
                  <span className="col-span-3 text-foreground">{selectedClient.created_at}</span>
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
              <DialogTitle>Modifier le Client</DialogTitle>
              <DialogDescription>
                Mettez à jour les détails du client.
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
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-societe" className="text-right">
                  Société
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-societe"
                    value={formData.societe}
                    onChange={(e) =>
                      setFormData({ ...formData, societe: e.target.value })
                    }
                    className={errors.societe ? "border-destructive" : ""}
                  />
                  {errors.societe && <p className="text-destructive text-sm mt-1">{errors.societe}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-statut" className="text-right">
                  Statut
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.statut}
                    onValueChange={(value) =>
                      setFormData({ ...formData, statut: value })
                    }
                  >
                    <SelectTrigger className={errors.statut ? "border-destructive" : ""}>
                      <SelectValue placeholder="Choisir un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="client_actif">Client Actif</SelectItem>
                      <SelectItem value="inactif">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.statut && <p className="text-destructive text-sm mt-1">{errors.statut}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-notes" className="text-right">
                  Notes
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className={errors.notes ? "border-destructive" : ""}
                  />
                  {errors.notes && <p className="text-destructive text-sm mt-1">{errors.notes}</p>}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleEditClient}
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
                Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
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
                onClick={handleDeleteClient}
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
