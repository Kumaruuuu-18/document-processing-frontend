import React from "react"
import { CloudUpload, FileText, CheckSquare, Settings, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
// import DataSkateLogo from "@/assets/DataSkate-logo-16_9 (Main) (1).png"  

const Sidebar = ({ activeItem, setActiveItem, isOpen, setIsOpen }) => {
    const navItems = [
        { name: "Upload Center", icon: CloudUpload },
        { name: "Review Queue", icon: CheckSquare },
        { name: "Documents", icon: FileText },
        { name: "Settings", icon: Settings },
    ]

    const handleItemClick = (itemName) => setActiveItem(itemName)

    return (
        <div className={`h-screen bg-white border-r shadow-sm transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}>
            {/* Header with toggle */}
            <div className="h-16 flex items-center justify-between px-4 border-b">
                {isOpen && <h1 className="text-xl font-bold">DocAI</h1>}
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            {/* Body with nav + footer pushed down */}
            <div className="flex flex-col h-[calc(100%-4rem)] justify-between">
                {/* Nav items */}
                <nav className="p-2 space-y-1">
                    {navItems.map((item) => (
                        <Button
                            key={item.name}
                            variant="ghost"
                            onClick={() => handleItemClick(item.name)}
                            className={`w-full justify-start gap-2 transition-all duration-200
                ${activeItem === item.name
                                    ? "bg-primary/10 text-primary border-l-4 border-primary font-medium"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"}
              `}
                        >
                            <item.icon className={`h-5 w-5 ${activeItem === item.name ? "text-primary" : ""}`} />
                            {isOpen && <span>{item.name}</span>}
                        </Button>
                    ))}
                </nav>


                {/* Footer */}
                <div className="p-4 border-t text-sm text-gray-500 flex justify-center">
                    {isOpen ? (
                        <img
                            src="https://dataskate.io/wp-content/uploads/2025/04/cropped-logo-1-140x17.webp"
                            alt="DataSkate"
                            className="w-32 h-auto object-contain"
                        />
                    ) : (
                        "DS"
                    )}
                </div>


            </div>
        </div>
    )
}

export default Sidebar
