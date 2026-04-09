import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GeneralInformation({ formData, setFormData, isEditing }: any) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
                <Label className="text-base font-semibold">General Information</Label>
            </div>
            <div className="space-y-2">
                <Label>Project Code</Label>
                <Input type="text" value={formData.projectCode || ""} readOnly className="readOnlyInput" />
            </div>
            <div className="space-y-2">
                <Label>Requestor</Label>
                <Input
                    type="text"
                    value={formData.requestor || ""}
                    readOnly={!isEditing}
                    onChange={(e) => setFormData({ ...formData, requestor: e.target.value })}
                    className={!isEditing ? "readOnlyInput" : ""}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label>Store Category</Label>
                <Input
                    type="text"
                    value={formData.storeCategory || ""}
                    readOnly={!isEditing}
                    onChange={(e) => setFormData({ ...formData, storeCategory: e.target.value })}
                    className={!isEditing ? "readOnlyInput" : ""}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label>Store Name</Label>
                <Input
                    type="text"
                    value={formData.storeName || ""}
                    readOnly={!isEditing}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    className={!isEditing ? "readOnlyInput" : ""}
                    required
                />
            </div>
        </div>
    );
}