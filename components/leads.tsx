"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Plus, FileDown, Trash, ChevronLeft, ChevronRight, Filter, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Lead {
  id: number
  company: string
  first_name: string
  last_name: string
  email: string
  phone: string
  title: string
  city: string
  state: string
  website: string
  linkedin_url: string
  industry: string
  revenue: string
  product_service_category: string
  business_type: string
  employees_range: string
  year_founded: number
  owner_linkedin: string
  owner_age: string
  status: string
  additional_notes: string
  created_at: string
  updated_at: string
}

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [selectedLeads, setSelectedLeads] = useState<number[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalLeads, setTotalLeads] = useState(0)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  
  // Basic filters
  const [companyFilter, setCompanyFilter] = useState("_all")
  const [locationFilter, setLocationFilter] = useState("_all")
  const [roleFilter, setRoleFilter] = useState("_all")
  const [statusFilter, setStatusFilter] = useState("_all")
  
  // Filter options for dropdowns
  const [companies, setCompanies] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [roles, setRoles] = useState<string[]>([])
  const [statuses, setStatuses] = useState<string[]>(["new", "contacted", "qualified", "proposal", "closed"])

  useEffect(() => {
    fetchLeads()
  }, [page, rowsPerPage])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://100.25.152.164:8000/api/leads", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + btoa("developer:developer123")
        }
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch leads")
      }
      
      const data = await response.json()
      setLeads(data)
      setTotalLeads(data.length)
      
      // Extract unique values for filters
      if (data.length > 0) {
        const uniqueCompanies = [...new Set(data.map((lead: Lead) => lead.company).filter(Boolean))] as string[]
        const uniqueLocations = [...new Set(data.map((lead: Lead) => `${lead.city}, ${lead.state}`).filter(Boolean))] as string[]
        const uniqueRoles = [...new Set(data.map((lead: Lead) => lead.title).filter(Boolean))] as string[]
        
        setCompanies(uniqueCompanies)
        setLocations(uniqueLocations)
        setRoles(uniqueRoles)
      }
      
    } catch (error) {
      console.error("Error fetching leads:", error)
      toast.error("Failed to load leads. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(filteredLeads.map(lead => lead.id))
    } else {
      setSelectedLeads([])
    }
  }

  const handleSelectLead = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, id])
    } else {
      setSelectedLeads(selectedLeads.filter(leadId => leadId !== id))
    }
  }

  const handleExport = (format: string) => {
    toast.success(`Exporting ${selectedLeads.length} leads as ${format.toUpperCase()}`)
    setIsExportDialogOpen(false)
  }

  const handleDeleteSelected = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) {
      // Implement delete API call here
      toast.success(`${selectedLeads.length} leads deleted successfully`)
      setSelectedLeads([])
      fetchLeads()
    }
  }

  const applyFilters = () => {
    let filtered = leads

    // Apply search text filter
    if (searchText) {
      const search = searchText.toLowerCase()
      filtered = filtered.filter(lead => 
        lead.company?.toLowerCase().includes(search) ||
        lead.first_name?.toLowerCase().includes(search) ||
        lead.last_name?.toLowerCase().includes(search) ||
        lead.email?.toLowerCase().includes(search) ||
        lead.title?.toLowerCase().includes(search)
      )
    }

    // Apply basic filters
    if (companyFilter && companyFilter !== "_all") {
      filtered = filtered.filter(lead => lead.company === companyFilter)
    }
    
    if (locationFilter && locationFilter !== "_all") {
      filtered = filtered.filter(lead => `${lead.city}, ${lead.state}` === locationFilter)
    }
    
    if (roleFilter && roleFilter !== "_all") {
      filtered = filtered.filter(lead => lead.title === roleFilter)
    }
    
    if (statusFilter && statusFilter !== "_all") {
      filtered = filtered.filter(lead => lead.status === statusFilter)
    }

    return filtered
  }

  const clearFilters = () => {
    setSearchText("")
    setCompanyFilter("_all")
    setLocationFilter("_all")
    setRoleFilter("_all")
    setStatusFilter("_all")
    setShowAdvancedFilters(false)
  }

  const filteredLeads = applyFilters()
  const paginatedLeads = filteredLeads.slice((page - 1) * rowsPerPage, page * rowsPerPage)
  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lead Data</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search across all fields..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Company</label>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Location</label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Role/Title</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Lead Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Clear Filters
            </Button>

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{filteredLeads.length}</span> leads found
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="selectAll"
                    checked={selectedLeads.length > 0 && selectedLeads.length === filteredLeads.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="selectAll" className="text-sm">Select All</label>
                </div>

                <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      disabled={selectedLeads.length === 0}
                    >
                      <FileDown className="h-4 w-4" />
                      Export Selected ({selectedLeads.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Export Options</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <div className="font-medium">Export Format</div>
                        <div className="flex flex-col gap-2">
                          <Button onClick={() => handleExport('csv')}>Export as CSV</Button>
                          <Button onClick={() => handleExport('excel')}>Export as Excel</Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="destructive" 
                  className="flex items-center gap-2"
                  disabled={selectedLeads.length === 0}
                  onClick={handleDeleteSelected}
                >
                  <Trash className="h-4 w-4" />
                  Delete Selected ({selectedLeads.length})
                </Button>

                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Filter className="h-4 w-4" />
                  Advanced Filters
                </Button>
              </div>
            </div>
          </div>

          {showAdvancedFilters && (
            <div className="mt-6 p-4 border rounded-md bg-muted/30">
              <h3 className="text-lg font-medium mb-4">Advanced Filters</h3>
              <div className="grid gap-4">
                <div className="flex items-center gap-4">
                  <Select>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select Field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="first_name">First Name</SelectItem>
                      <SelectItem value="last_name">Last Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="industry">Industry</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="startsWith">Starts with</SelectItem>
                      <SelectItem value="endsWith">Ends with</SelectItem>
                      <SelectItem value="greaterThan">Greater than</SelectItem>
                      <SelectItem value="lessThan">Less than</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input placeholder="Enter value..." className="w-[300px]" />

                  <Select defaultValue="AND">
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Logic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="ghost" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button>Apply Filters</Button>
                <Button variant="outline">Clear Advanced Filters</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="border rounded-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={
                      paginatedLeads.length > 0 && 
                      paginatedLeads.every(lead => selectedLeads.includes(lead.id))
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedLeads([...selectedLeads, ...paginatedLeads.map(lead => lead.id).filter(id => !selectedLeads.includes(id))])
                      } else {
                        setSelectedLeads(selectedLeads.filter(id => !paginatedLeads.map(lead => lead.id).includes(id)))
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={(checked) => handleSelectLead(lead.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>{lead.id}</TableCell>
                    <TableCell>{lead.company || '-'}</TableCell>
                    <TableCell>{`${lead.first_name || ''} ${lead.last_name || ''}`}</TableCell>
                    <TableCell>{lead.email || '-'}</TableCell>
                    <TableCell>{lead.title || '-'}</TableCell>
                    <TableCell>{`${lead.city || ''}, ${lead.state || ''}`}</TableCell>
                    <TableCell>
                      <Select 
                        defaultValue={lead.status || "new"}
                        onValueChange={(value) => {
                          // Handle status change
                          toast.success(`Status updated to ${value}`)
                        }}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(lead.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="flex items-center gap-2">
            <Select
              value={rowsPerPage.toString()}
              onValueChange={(value) => setRowsPerPage(Number(value))}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="25">25 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="100">100 rows</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              Showing {Math.min((page - 1) * rowsPerPage + 1, filteredLeads.length)} to {Math.min(page * rowsPerPage, filteredLeads.length)} of {filteredLeads.length} leads
            </span>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    setPage(Math.max(1, page - 1))
                  }} 
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = page <= 3 ? i + 1 : page + i - 2
                if (pageNumber <= totalPages) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink 
                        href="#" 
                        isActive={pageNumber === page}
                        onClick={(e) => {
                          e.preventDefault()
                          setPage(pageNumber)
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }
                return null
              })}
              
              {totalPages > 5 && page < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              {totalPages > 5 && page < totalPages - 1 && (
                <PaginationItem>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(totalPages)
                    }}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    setPage(Math.min(totalPages, page + 1))
                  }} 
                  className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
} 