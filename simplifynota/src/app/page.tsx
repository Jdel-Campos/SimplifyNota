"use client";

import { useState } from "react";
import { generatePDF } from "@/utils/generatePDF";
import extenso from "extenso";


const formatCurrency = (value: string): string => {
  const sanitizedValue = value.replace(/[^\d,.]/g, ""); 
  const normalizedValue = sanitizedValue.replace(",", ".");
  const numericValue = parseFloat(normalizedValue);

  if (isNaN(numericValue)) return "";

  const formattedValue = numericValue.toFixed(2);
  const parts = formattedValue.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "."); 
  const decimalPart = parts[1];

  return `${integerPart},${decimalPart}`;
};

export default function Home() {
  const [formData, setFormData] = useState({
    client: "",
    rawValue: "",
    value: "",
    valueInWords: "",
    jobDescription: "",
    eventName: "",
    eventDate: "",
    eventLocation: "",
    startTime: "",
    endTime: "",
    city: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "value") {
      const numericValue = parseFloat(value.replace(",", "."));

      setFormData((prevState) => ({
        ...prevState,
        rawValue: value,
        value,
        valueInWords: !isNaN(numericValue)
          ? `${extenso(numericValue, { mode: "currency" })}`
          : "",
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleBlur = () => {
    setFormData((prevState) => ({
      ...prevState,
      value: formatCurrency(prevState.rawValue), 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          value: formData.rawValue, 
        }),
      });

      if (response.ok) {
        generatePDF(formData);

        setFormData({
          client: "",
          rawValue: "",
          value: "",
          valueInWords: "",
          jobDescription: "",
          eventName: "",
          eventDate: "",
          eventLocation: "",
          startTime: "",
          endTime: "",
          city: "",
        });
      } else {
        const errorData = await response.json();
        alert(`Erro ao salvar nota: ${errorData.message}`);
      }
    } catch (error) {
      console.log("Erro ao enviar formulário:", error);
      alert("Erro ao salvar a nota");
    }
  };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Geração de Recibo</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-8 max-w-2xl w-full space-y-6"
      >
        <div className="flex flex-wrap gap-4">

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Nome do Recebedor
            </label>
            <input
              type="text"
              name="client"
              value={formData.client}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Nome do Evento
            </label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
          <input
            type="text"
            name="value"
            value={formData.value}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={() =>
              setFormData((prevState) => ({
                ...prevState,
                value: prevState.rawValue,
              }))
            }
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Data do Evento
            </label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Horário de Início
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Horário de Término
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Local do Evento
            </label>
            <input
              type="text"
              name="eventLocation"
              value={formData.eventLocation}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Cidade
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descrição do Trabalho
          </label>
          <textarea
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Gerar Recibo
        </button>
      </form>
    </div>
    );
}
