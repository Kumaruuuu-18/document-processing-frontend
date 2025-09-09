import React, { useState } from 'react'
import { CloudUpload, FileText, CheckSquare, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

const Sidebar = ({activeItem,setActiveItem}) => {

    
    const navItems = [
        { name: "Upload Center", icon: CloudUpload, path: "/Upload" },
        { name: "Review Queue", icon: CheckSquare, path: "/review" },
        { name: "Documents", icon: FileText, path: "/documents" },
        // { name: "Settings", icon: Settings, path: "/settings" },
    ];

    const handleItemClick = (itemName) => {
        setActiveItem(itemName)
        
    }

    return (
        <div className="fixed left-0 top-0 flex flex-col h-screen w-64 border-r bg-white shadow-sm z-10">
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b">
                <h1 className="text-xl font-bold">DocAI</h1>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <Button
                        key={item.name}
                        variant="ghost"
                        onClick={() => handleItemClick(item.name)}
                        className={`
                            w-full justify-start gap-2 transition-all duration-200
                            ${activeItem === item.name 
                                ? 'bg-primary/10 text-primary border-l-8 border-primary font-medium' 
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            }
                        `}
                    >
                        <item.icon className={`h-5 w-5 ${activeItem === item.name ? 'text-primary' : ''}`} />
                        {item.name}
                    </Button>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t text-sm text-gray-500">
                DataSkate
            </div>
        </div>
    )
}

export default Sidebar
