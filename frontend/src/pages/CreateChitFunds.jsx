import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Plus, Minus, Loader2 } from "lucide-react";
import Header from "@/components/header/Header";
import { ChitFundFactoryAbi, deployedContract } from "@/lib/Contract";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { waitForTransactionReceipt } from "viem/actions";
import { fetchEthereumPrice } from "@/lib/EthereumPrices";
import { parseEther } from "viem";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const schema = z.object({
  name: z
    .string()
    .min(1, "Chit Fund name is required")
    .max(100, "Name must be 100 characters or less"),
  numberOfPeople: z
    .number()
    .min(1, "At least 1 person is required")
    .max(100, "Maximum 100 people allowed"),
  addresses: z
    .array(
      z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address")
    )
    .min(1, "At least 2 addresses are required"),
  collateralPercentage: z
    .number()
    .min(0, "Minimum 0%")
    .max(100, "Maximum 100%"),
  totalAmount: z.number().min(1000, "Minimum amount is 1000"),
  circulationTime: z
    .number()
    .min(1, "Minimum 1 month")
    .max(60, "Maximum 60 months"),
  cycleDuration: z
    .number()
    .min(1, "Minimum 1 minute")
    .max(43200, "Maximum 30 days"),
  cycleDurationType: z.enum(["minutes", "days"]),
  startDate: z.date().min(new Date(), "Start date must be in the future"),
});

function CreateChitFund() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [ethereumPrice, setethereumPrice] = useState(0);
  const { data: hash, isPending, writeContract } = useWriteContract();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      numberOfPeople: 1,
      addresses: ["", ""],
      collateralPercentage: 10,
      totalAmount: 1000,
      circulationTime: 12,
      cycleDuration: 30,
      cycleDurationType: "days",
      startDate: new Date(Date.now() + 86400000), // Default to tomorrow
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
  });

  const numberOfPeople = watch("numberOfPeople");
  const cycleDurationType = watch("cycleDurationType");

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    try {
      const startTimestamp = Math.floor(data.startDate.getTime() / 1000);
      let cycleDurationInSeconds;
      if (data.cycleDurationType === "minutes") {
        cycleDurationInSeconds = data.cycleDuration * 60; // Convert minutes to seconds
      } else {
        cycleDurationInSeconds = data.cycleDuration * 86400; // Convert days to seconds
      }
      
    
      writeContract({
        address: deployedContract,
        abi: ChitFundFactoryAbi,
        functionName: "createChitFund",
        args: [
          data.name,
          parseEther((data.totalAmount / ethereumPrice).toString()),
          data.numberOfPeople,
          data.circulationTime,
          cycleDurationInSeconds,
          startTimestamp,
          data.addresses,
          data.collateralPercentage
        ],
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  };

  const { isFetched } = useWaitForTransactionReceipt({
    hash: hash,
  });

  useEffect(() => {
    if (isFetched) {
      setSubmitSuccess(true);
      setIsSubmitting(false);
    }
  }, [isFetched]);

  const populateEthereumPrice = async () => {
    setethereumPrice(await fetchEthereumPrice());
  };

  useEffect(() => {
    populateEthereumPrice();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.div
          className="max-w-2xl mx-auto"
          variants={fadeIn}
          initial="initial"
          animate="animate"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Create a New Chit Fund
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submitSuccess ? (
                <div className="text-center text-green-600">
                  <p className="text-xl font-semibold">
                    Chit Fund Created Successfully!
                  </p>
                  <Button
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-4"
                  >
                    Create Another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Chit Fund Name</Label>
                    <Input id="name" type="text" {...register("name")} />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="numberOfPeople">Number of People</Label>
                    <Controller
                      name="numberOfPeople"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="numberOfPeople"
                          type="number"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            field.onChange(value);
                            if (value > fields.length) {
                              for (let i = fields.length; i < value; i++) {
                                append("");
                              }
                            } else if (value < fields.length) {
                              for (let i = fields.length; i > value; i--) {
                                remove(i - 1);
                              }
                            }
                          }}
                        />
                      )}
                    />
                    {errors.numberOfPeople && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.numberOfPeople.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Addresses of People Involved</Label>
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center mt-2">
                        <Input
                          placeholder={`Address ${index + 1}`}
                          {...register(`addresses.${index}`)}
                        />
                        {index > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => remove(index)}
                            className="ml-2"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {fields.length < numberOfPeople && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => append("")}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Address
                      </Button>
                    )}
                    {errors.addresses && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.addresses.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="collateralPercentage">
                      Collateral Percentage
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="collateralPercentage"
                        control={control}
                        render={({ field }) => (
                          <Slider
                            id="collateralPercentage"
                            min={0}
                            max={100}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        )}
                      />
                      <span className="w-12 text-center">
                        {watch("collateralPercentage")}%
                      </span>
                    </div>
                    {errors.collateralPercentage && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.collateralPercentage.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="totalAmount">
                      Total Amount in Circulation (₹)
                    </Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      {...register("totalAmount", { valueAsNumber: true })}
                    />
                    {errors.totalAmount && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.totalAmount.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="circulationTime">
                      Time for Circulation (months)
                    </Label>
                    <Input
                      id="circulationTime"
                      type="number"
                      {...register("circulationTime", { valueAsNumber: true })}
                    />
                    {errors.circulationTime && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.circulationTime.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cycleDuration">
                      Cycle Duration
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="cycleDuration"
                        type="number"
                        {...register("cycleDuration", { valueAsNumber: true })}
                        className="flex-grow"
                      />
                      <select
                        {...register("cycleDurationType")}
                        className="border border-gray-300 rounded-md p-2"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                    {errors.cycleDuration && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cycleDuration.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register("startDate", {
                        setValueAs: (v) => (v ? new Date(v) : undefined),
                      })}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {errors.startDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.startDate.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Chit Fund...
                      </>
                    ) : (
                      "Create Chit Fund"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          © 2024 BaseTrust. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default CreateChitFund;