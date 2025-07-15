"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const resourceTypes = ["all", "Issue", "User", "Comment", "Department", "System"];
const actions = ["all", "create", "update", "delete", "login", "logout", "status_change", "assignment", "comment", "other"];

export default function AuditLogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resourceType, setResourceType] = useState("all");
  const [action, setAction] = useState("all");
  const [actor, setActor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/audit");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page.",
        variant: "destructive"
      });
      router.push("/");
    }
  }, [status, session, router, toast]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchLogs();
    }
    // eslint-disable-next-line
  }, [status, session, page, resourceType, action, actor, startDate, endDate]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/admin/audit?page=${page}`;
      if (resourceType && resourceType !== "all") url += `&resourceType=${resourceType}`;
      if (action && action !== "all") url += `&action=${action}`;
      if (actor) url += `&actor=${actor}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch audit logs");
      const data = await response.json();
      setLogs(data.logs);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message || "Failed to load audit logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (status !== "authenticated" || session?.user?.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Resource Type" />
              </SelectTrigger>
              <SelectContent>
                {resourceTypes.map(rt => (
                  <SelectItem key={rt} value={rt}>{rt === "all" ? "All Types" : rt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                {actions.map(a => (
                  <SelectItem key={a} value={a}>{a === "all" ? "All Actions" : a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Actor ID"
              className="w-full md:w-[180px]"
              value={actor}
              onChange={e => setActor(e.target.value)}
            />
            <Input
              type="date"
              className="w-full md:w-[180px]"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              className="w-full md:w-[180px]"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
            <Button variant="outline" onClick={() => { setPage(1); fetchLogs(); }}>Filter</Button>
          </div>
          {/* Table */}
          {loading ? (
            <div className="text-center py-8">Loading audit logs...</div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">{error}</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">No audit logs found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource Type</TableHead>
                    <TableHead>Resource ID</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map(log => (
                    <TableRow key={log._id}>
                      <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        {log.actor ? (
                          <span>
                            <Badge>{log.actor.name}</Badge>
                            <br />
                            <span className="text-xs text-gray-500">{log.actor.email}</span>
                          </span>
                        ) : "System"}
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.resourceType}</TableCell>
                      <TableCell>{log.resourceId}</TableCell>
                      <TableCell>
                        <pre className="text-xs whitespace-pre-wrap break-words max-w-xs">{JSON.stringify(log.details, null, 2)}</pre>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
