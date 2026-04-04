// src/app/bookkeeping/(protected)/financial/create/page.tsx
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createRequest } from "@/actions/request/actions";

export default async function Page() {
    // 1. Calculate the expected project code for the UI display
    const currentYear = new Date().getFullYear();
    const currentYearCount = await prisma.request.count({
        where: {
            projectCode: {
                startsWith: `${currentYear}-`,
            },
        },
    });
    
    const nextNumber = currentYearCount + 1;
    const expectedProjectCode = `${currentYear}-${String(nextNumber).padStart(4, '0')}`;

    return (
        <div className="max-w-xl mx-auto mt-8 p-6 bg-card text-card-foreground rounded-lg border shadow-sm">
            <h1 className="text-2xl font-semibold leading-none tracking-tight mb-6">
                Create Financial Request
            </h1>
            
            <form action={createRequest} className="space-y-6">
                
                {/* Project Code Field (Read-Only) */}
                <div className="space-y-2">
                    <Label htmlFor="projectCode">Project Code</Label>
                    <Input
                        type="text"
                        id="projectCode"
                        name="projectCode"
                        value={expectedProjectCode}
                        readOnly
                        className="bg-muted text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-[0.8rem] text-muted-foreground">
                        *Auto-generated. Will verify next available number upon save.
                    </p>
                </div>

                {/* Product Name Field */}
                <div className="space-y-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                        type="text"
                        id="productName"
                        name="productName"
                        required
                        placeholder="Enter product name..."
                    />
                </div>

                {/* Ordered Stock Field */}
                <div className="space-y-2">
                    <Label htmlFor="numOfOrderedStock">Number of Ordered Stock</Label>
                    <Input
                        type="number"
                        id="numOfOrderedStock"
                        name="numOfOrderedStock"
                        required
                        min="1"
                        placeholder="e.g. 50"
                    />
                </div>

                {/* Amount Due Field */}
                <div className="space-y-2">
                    <Label htmlFor="amountDue">Amount</Label>
                    <Input
                        type="number"
                        id="amountDue"
                        name="amountDue"
                        required
                        min="0"
                        step="0.01"
                        placeholder="e.g. 199.99"
                    />
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full">
                    Save Request
                </Button>
            </form>
        </div>
    );
}