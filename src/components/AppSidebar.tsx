
import { HomeIcon, PieChart, Wallet, BarChart, Calendar, Settings } from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    icon: HomeIcon,
    path: "/"
  },
  {
    title: "Transações",
    icon: Wallet,
    path: "/transactions"
  },
  {
    title: "Relatórios",
    icon: BarChart,
    path: "/reports"
  },
  {
    title: "Orçamentos",
    icon: PieChart,
    path: "/budgets"
  },
  {
    title: "Calendário",
    icon: Calendar,
    path: "/calendar"
  },
  {
    title: "Configurações",
    icon: Settings,
    path: "/settings"
  }
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h1 className="text-xl font-bold flex items-center">
          <Wallet className="mr-2" />
          FinanceEase
        </h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path} className="flex items-center">
                      <item.icon className="mr-2 h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
