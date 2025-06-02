
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
import { Trash2, Edit, Eye, Plus, ArrowLeft, Search } from "lucide-react";

// Define Zod schema for transaction validation
const transactionSchema = z.object({
  description: z.string().min(1, "La description est requise").max(100, "La description ne doit pas dépasser 100 caractères"),
  type: z.enum(["revenu", "depense"], {
    errorMap: () => ({ message: "Le type doit être 'revenu' ou 'dépense'" }),
  }),
  montant: z.number().min(0, "Le montant doit être positif").max(1000000, "Le montant ne doit pas dépasser 1,000,000"),
  date: z.string().min(1, "La date est requise"),
});

export default function Comptabilite() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    type: "",
    montant: "",
    date: "",
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const handleGetTransactions = async () => {
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/comptabilite/`, {
        method: "GET",
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      setTransactions(data.data || []);
      setFilteredTransactions(data.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des transactions:", error);
      toast.error("Erreur lors de la récupération des transactions");
    }
  };

  useEffect(() => {
    handleGetTransactions();
  }, []);

  useEffect(() => {
    const filtered = transactions.filter((transaction) =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTransactions(filtered);
  }, [searchTerm, transactions]);

  const validateForm = (data) => {
    const result = transactionSchema.safeParse({
      ...data,
      montant: parseFloat(data.montant) || 0,
    });
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

  const handleAddTransaction = async () => {
    if (!validateForm(formData)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    const newTransaction = {
      id: `TRX${(transactions.length + 1).toString().padStart(3, "0")}`,
      description: formData.description,
      type: formData.type,
      montant: parseFloat(formData.montant),
      date: formData.date,
    };

    try {
      const response = await fetch(`http://alphatek.fr:3110/api/comptabilite/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTransaction),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      setTransactions(data.data || []);
      setFilteredTransactions(data.data || []);
      toast.success("Transaction ajoutée avec succès !");
      setFormData({
        description: "",
        type: "",
        montant: "",
        date: "",
      });
      setIsAddOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la transaction:", error);
      toast.error("Erreur lors de l'ajout de la transaction");
    }
  };

  const handleEditTransaction = async () => {
    if (!validateForm(formData)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    const transactionToEdit = {
      id: formData.id,
      description: formData.description,
      type: formData.type,
      montant: parseFloat(formData.montant),
      date: formData.date,
    };

    try {
      const response = await fetch(`http://alphatek.fr:3110/api/comptabilite/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionToEdit),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      toast.success(data.message);
      setTransactions(
        transactions.map((t) =>
          t.id === selectedTransaction.id
            ? { ...t, ...transactionToEdit }
            : t
        )
      );
      setFilteredTransactions(
        filteredTransactions.map((t) =>
          t.id === selectedTransaction.id
            ? { ...t, ...transactionToEdit }
            : t
        )
      );
      setIsEditOpen(false);
      setFormData({
        description: "",
        type: "",
        montant: "",
        date: "",
      });
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Erreur lors de la modification de la transaction:", error);
      toast.error("Erreur lors de la modification de la transaction");
    }
  };

  const handleDeleteTransaction = async () => {
    const transactionToDelete = { id: selectedTransaction.id };
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/comptabilite/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionToDelete),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      toast.success(data.message);
      setTransactions(transactions.filter((t) => t.id !== selectedTransaction.id));
      setFilteredTransactions(filteredTransactions.filter((t) => t.id !== selectedTransaction.id));
      setIsDeleteOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de la transaction:", error);
      toast.error("Erreur lors de la suppression de la transaction");
    }
  };

  const openEditModal = (transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      id: transaction.id,
      description: transaction.description,
      type: transaction.type,
      montant: transaction.montant,
      date: transaction.date,
    });
    setErrors({});
    setIsEditOpen(true);
  };

  const openViewModal = (transaction) => {
    setSelectedTransaction(transaction);
    setIsViewOpen(true);
  };

  const openDeleteModal = (transaction) => {
    setSelectedTransaction(transaction);
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
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold">Gestion de la Comptabilité</h1>
          <div className="flex items-center gap-2">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2"
                  aria-label="Ajouter une nouvelle transaction"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Ajouter une Transaction</DialogTitle>
                  <DialogDescription>
                    Remplissez les détails de la nouvelle transaction.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
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
                        className={errors.description ? "border-destructive" : ""}
                      />
                      {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                          <SelectValue placeholder="Choisir un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="revenu">Revenu</SelectItem>
                          <SelectItem value="depense">Dépense</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.type && <p className="text-destructive text-sm mt-1">{errors.type}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="montant" className="text-right">
                      Montant
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="montant"
                        type="number"
                        value={formData.montant}
                        onChange={(e) =>
                          setFormData({ ...formData, montant: e.target.value })
                        }
                        className={errors.montant ? "border-destructive" : ""}
                      />
                      {errors.montant && <p className="text-destructive text-sm mt-1">{errors.montant}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className={errors.date ? "border-destructive" : ""}
                      />
                      {errors.date && <p className="text-destructive text-sm mt-1">{errors.date}</p>}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleAddTransaction}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Ajouter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Champ de recherche */}
        <div className="mt-18 mb-4 flex items-center gap-4">
          <div className="relative w-64">
            <Input
              placeholder="Rechercher une transaction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Tableau des transactions */}
        <div className="mt-8 bg-card border border-border rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Historique des Transactions</h2>
          </div>
          <div className="p-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="w-[100px] font-semibold text-foreground">ID</TableHead>
                  <TableHead className="font-semibold text-foreground">Description</TableHead>
                  <TableHead className="font-semibold text-foreground">Type</TableHead>
                  <TableHead className="font-semibold text-foreground">Montant</TableHead>
                  <TableHead className="font-semibold text-foreground">Date</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions && filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">{transaction.id}</TableCell>
                      <TableCell className="text-foreground">{transaction.description}</TableCell>
                      <TableCell className="text-foreground">{transaction.type}</TableCell>
                      <TableCell className="text-foreground">{transaction.montant}</TableCell>
                      <TableCell className="text-foreground">{formattedDate(transaction.date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openViewModal(transaction)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditModal(transaction)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openDeleteModal(transaction)}
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
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      Aucune transaction trouvée
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
              <DialogTitle>Détails de la Transaction</DialogTitle>
              <DialogDescription>
                Informations complètes sur la transaction sélectionnée.
              </DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">ID</Label>
                  <span className="col-span-3 text-foreground">{selectedTransaction.id}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">Description</Label>
                  <span className="col-span-3 text-foreground">{selectedTransaction.description}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">Type</Label>
                  <span className="col-span-3 text-foreground">{selectedTransaction.type}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">Montant</Label>
                  <span className="col-span-3 text-foreground">{selectedTransaction.montant}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium text-muted-foreground">Date</Label>
                  <span className="col-span-3 text-foreground">{selectedTransaction.date}</span>
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
              <DialogTitle>Modifier la Transaction</DialogTitle>
              <DialogDescription>
                Mettez à jour les détails de la transaction.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
                    className={errors.description ? "border-destructive" : ""}
                  />
                  {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-type" className="text-right">
                  Type
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                      <SelectValue placeholder="Choisir un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenu">Revenu</SelectItem>
                      <SelectItem value="depense">Dépense</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-destructive text-sm mt-1">{errors.type}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-montant" className="text-right">
                  Montant
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-montant"
                    type="number"
                    value={formData.montant}
                    onChange={(e) =>
                      setFormData({ ...formData, montant: e.target.value })
                    }
                    className={errors.montant ? "border-destructive" : ""}
                  />
                  {errors.montant && <p className="text-destructive text-sm mt-1">{errors.montant}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-date" className="text-right">
                  Date
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className={errors.date ? "border-destructive" : ""}
                  />
                  {errors.date && <p className="text-destructive text-sm mt-1">{errors.date}</p>}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleEditTransaction}
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
                Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action est irréversible.
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
                onClick={handleDeleteTransaction}
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
