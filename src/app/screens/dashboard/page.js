"use client";
import React, { use ,useEffect,useState} from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import { Card,CardFooter, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const [dashboardData,setData] = useState([]);

const getDashData=async () => {
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/dashboard/`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Erreur de réseau");
      }
      const data = await response.json();
      setData(data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des donnees:", error);
      toast.error("Erreur lors de la récupération des donnees");
    }
  };
  useEffect(() => {
    getDashData();
  }, []);
const chartData = [
  { status: "termines", nombre: dashboardData.projets_termines, fill: "green" },
  { status: "en_cours", nombre: dashboardData.projets_en_cours, fill: "yellow" },
  { status: "en_attente", nombre: dashboardData.projets_non_demarres, fill: "orange" },
  { status: "annules", nombre: 50, fill: "red" },
  { status: "autres", nombre: 150, fill: "black" },
];

const chartConfig = {
  nombre: {
    label: "Nombre",
  },
  termines: {
    label: "Terminés",
    color: "green",
  },
  en_cours: {
    label: "En Cours",
    color: "yellow",
  },
  en_attente: {
    label: "En Attente",
    color: "orange",
  },
  annules: {
    label: "Annulés",
    color: "red",
  },
  autres: {
    label: "Autres",
    color: "black",
  },
};




export default function Dashboard() {
  const totalNombre = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.nombre, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:ml-64 lg:ml-64 xl:ml-64">
      {/* Fixed header with sky-blue background */}
      <div className="fixed top-0 left-0 md:left-64 lg:left-64 xl:left-64 right-0 bg-sky-500 text-white p-4 shadow-md text-center z-10">
        <h1 className="text-2xl font-bold">Tableau de Bord</h1>
      </div>
      {/* Fixed row at the top with space-between */}
      <div className=" mt-23 top-6 left-0 md:left-64 lg:left-64 xl:left-64 right-0 p-4 flex flex-wrap justify-between ">
        <div className="bg-white p-4 rounded-lg shadow-md text-center border-l-4 border-red-500 w-full sm:w-[48%] md:w-[23%] mb-4">
          <h1 className="text-lg font-bold text-sky-700">Tâches Non Assignées</h1>
          <h1 className="text-3xl font-bold text-red-500">18</h1>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center border-l-4 border-yellow-500 w-full sm:w-[48%] md:w-[23%] mb-4">
          <h1 className="text-lg font-bold text-sky-700">Tâches En Cours</h1>
          <h1 className="text-3xl font-bold text-yellow-500">15</h1>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center border-l-4 border-green-500 w-full sm:w-[48%] md:w-[23%] mb-4">
          <h1 className="text-lg font-bold text-sky-700">Tâches Terminées</h1>
          <h1 className="text-3xl font-bold text-green-500">32</h1>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center border-l-4 border-blue-500 w-full sm:w-[48%] md:w-[23%] mb-4">
          <h1 className="text-lg font-bold text-sky-700">Tâches Totales</h1>
          <h1 className="text-3xl font-bold text-blue-500">58</h1>
        </div>
      </div>
      {/* Main content area with padding to avoid overlap with fixed row */}
      <div className="flex-1 p-4 flex flex-row flex-wrap justify-around ">
        {/* Tasks/Projects section */}
        <div className="bg-white border-l-4 border-sky-500 shadow-md rounded-lg p-6 max-w-md w-full mt-4 md:mt-0">
          <div className="flex flex-col space-y-6 w-full">
            <div className="bg-sky-50 p-4 rounded-lg shadow-sm text-center border border-sky-200">
              <h2 className="text-xl font-bold text-sky-700">Tâches</h2>
              <div className="flex flex-col space-y-2 mt-4">
                {[
                  "Construction d'une maison R+1",
                  "Construction d'une maison R+1",
                  "Construction d'une maison R+1",
                ].map((task, index) => (
                  <div
                    key={index}
                    className="bg-white flex flex-row justify-between p-3 rounded-lg shadow-sm hover:bg-sky-100 transition-colors border border-sky-200"
                  >
                    <h3 className="text-md font-semibold text-gray-800">{task}</h3>
                    <div className="bg-green-500 rounded-full px-3 py-1 text-white text-sm">
                      Terminée
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-sky-50 p-4 rounded-lg shadow-sm text-center border border-sky-200">
              <h2 className="text-xl font-bold text-sky-700">Projets</h2>
              <div className="flex flex-col space-y-2 mt-4">
                {[
                  "Construction d'une maison R+1",
                  "Construction d'une maison R+1",
                  "Construction d'une maison R+1",
                ].map((project, index) => (
                  <div
                    key={index}
                    className="bg-white flex flex-row justify-between p-3 rounded-lg shadow-sm hover:bg-sky-100 transition-colors border border-sky-200"
                  >
                    <h3 className="text-md font-semibold text-gray-800">{project}</h3>
                    <div className="bg-green-500 rounded-full px-3 py-1 text-white text-sm">
                      Terminée
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Statistics section */}
        <div className="bg-white flex flex-col shadow-md rounded-lg p-6 max-w-md w-full text-center mt-4 md:mt-0 md:ml-4">
          <Card className="flex flex-col border-l-4 border-sky-500">
            <CardHeader className="items-center pb-0">
              <CardTitle className="text-xl font-bold text-sky-700">
                Statistiques des Projets
              </CardTitle>
              <CardDescription className="text-gray-600">
                Janvier - Juin 2024
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={chartData}
                    dataKey="nombre"
                    nameKey="status"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {totalNombre.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Projets
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {chartData.map((item) => (
                  <div key={item.status} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: chartConfig[item.status].color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {chartConfig[item.status].label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none text-sky-700">
                En hausse de 5.2% ce mois-ci <TrendingUp className="h-4 w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                Total des projets pour les 6 derniers mois
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}