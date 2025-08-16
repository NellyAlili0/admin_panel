import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Wallet,
  CreditCard,
  FileText,
  User,
  Car,
  Banknote,
  Clock,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { database } from "@/database/config";
import Link from "next/link";
import GenTable from "@/components/tables";
import {
  AddVehicleForm,
  ChangePasswordForm,
  EditDriverForm,
  MarkVerifiedForm,
} from "./forms";
import { SendNotificationForm } from "../../parents/forms";

export default async function Page({ params }: { params: any }) {
  const { driver_id } = await params;
  // driver information
  let driverInfo = await database
    .selectFrom("user")
    .select([
      "user.id",
      "user.name",
      "user.email",
      "user.phone_number",
      "user.kind",
      "user.meta",
      "user.wallet_balance",
      "user.is_kyc_verified",
      "user.created_at",
      "user.updated_at",
      "user.statusId", // Changed from status to statusId
    ])
    .where("user.email", "=", driver_id.replace("%40", "@"))
    .where("user.kind", "=", "Driver")
    .executeTakeFirst();
  if (!driverInfo) {
    return <div>Driver not found</div>;
  }
  // vehicle information
  let vehicleInfo = await database
    .selectFrom("vehicle")
    .selectAll()
    .where("vehicle.userId", "=", driverInfo?.id!) // Changed from user_id to userId
    .executeTakeFirst();
  // kyc information
  let kycInfo = await database
    .selectFrom("kyc")
    .select([
      "kyc.id",
      "kyc.national_id_front",
      "kyc.national_id_back",
      "kyc.passport_photo",
      "kyc.driving_license",
      "kyc.certificate_of_good_conduct",
      "kyc.is_verified",
    ])
    .where("kyc.userId", "=", driverInfo?.id) // Changed from user_id to userId
    .executeTakeFirst();
  // assigned rides
  let assignedRides = await database
    .selectFrom("ride")
    .leftJoin("student", "student.id", "ride.studentId") // Changed from ride.student_id to ride.studentId
    .select(["ride.id", "student.name", "ride.status", "ride.schedule"])
    .where("driverId", "=", driverInfo.id) // Changed from driver_id to driverId
    .execute();
  // trip history
  let tripHistory = await database
    .selectFrom("daily_ride")
    .leftJoin("ride", "ride.id", "daily_ride.rideId") // Changed from daily_ride.ride_id to daily_ride.rideId
    .leftJoin("student", "student.id", "ride.studentId") // Changed from ride.student_id to ride.studentId
    .select([
      "daily_ride.id",
      "daily_ride.status",
      "student.name as passenger",
      "daily_ride.start_time",
      "daily_ride.end_time",
      "daily_ride.kind",
    ])
    .where("daily_ride.driverId", "=", driverInfo.id) // Changed from daily_ride.driver_id to daily_ride.driverId
    .where("daily_ride.status", "!=", "Inactive")
    .orderBy("daily_ride.date", "desc")
    .execute();
  // transactions
  let transactions = await database
    .selectFrom("payment")
    .select([
      "payment.id",
      "payment.amount",
      "payment.kind",
      "payment.comments",
      "payment.transaction_type",
      "payment.created_at",
    ])
    .where("payment.userId", "=", driverInfo.id) // Changed from payment.user_id to payment.userId
    .execute();
  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/drivers",
            label: "Drivers",
          },
          {
            href: `/drivers/${driver_id}`,
            label: driverInfo?.name || driverInfo.email || "/driver",
          },
        ]}
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Driver Information{" "}
          </h1>
          <p className="text-muted-foreground"> {driverInfo.name} </p>
        </div>
        <div className="flex gap-2">
          {(vehicleInfo == null || vehicleInfo == undefined) && (
            <AddVehicleForm driver_id={driverInfo.id!.toString()} />
          )}
          {driverInfo.is_kyc_verified == false && (
            <MarkVerifiedForm driver_id={driverInfo.id!.toString()} />
          )}
          <SendNotificationForm parentId={driverInfo.id!.toString()} />
          <EditDriverForm driver={driverInfo} />
          <ChangePasswordForm driver={driverInfo} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Driver details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center gap-3">
                <div className="text-center">
                  <h2 className="text-xl font-bold">{driverInfo.name}</h2>
                  <Badge className="mt-1">
                    {driverInfo.is_kyc_verified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </div>
                  <p className="font-medium">{driverInfo.phone_number}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <p className="font-medium">{driverInfo.email}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>Neighborhood</span>
                  </div>
                  <p className="font-medium">{driverInfo.meta?.neighborhood}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>County</span>
                  </div>
                  <p className="font-medium">{driverInfo.meta?.county}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Joined</span>
                  </div>
                  <p className="font-medium">
                    {driverInfo.created_at.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
            <CardDescription>Wallet and payment details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    <span className="font-medium">Wallet Balance</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-8">
                    Top Up
                  </Button>
                </div>
                <p className="text-2xl font-bold">
                  {driverInfo.wallet_balance}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Preferred Payment Method</span>
                </h3>
                {driverInfo.meta?.payments && (
                  <div className="p-3 border rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-12 bg-slate-200 rounded flex items-center justify-center text-xs font-bold">
                        {driverInfo.meta?.payments.kind}
                      </div>
                      <div>
                        <p className="font-medium">
                          {driverInfo.meta?.payments.bank}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {driverInfo.meta?.payments.account_number} -{" "}
                          {driverInfo.meta?.payments.account_name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KYC Information */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>KYC Documents</CardTitle>
          <CardDescription>
            Verification documents submitted by the driver
          </CardDescription>
        </CardHeader>
        <CardContent>
          {kycInfo && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <KycDocumentCard
                title="National ID (Front)"
                icon={<FileText className="h-5 w-5" />}
                imagePath={kycInfo.national_id_front!}
              />
              <KycDocumentCard
                title="National ID (Back)"
                icon={<FileText className="h-5 w-5" />}
                imagePath={kycInfo.national_id_back!}
              />
              <KycDocumentCard
                title="Passport Photo"
                icon={<User className="h-5 w-5" />}
                imagePath={kycInfo.passport_photo!}
              />
              <KycDocumentCard
                title="Driving License"
                icon={<Car className="h-5 w-5" />}
                imagePath={kycInfo.driving_license!}
              />
              <KycDocumentCard
                title="Cert. of Good Conduct"
                icon={<Shield className="h-5 w-5" />}
                imagePath={kycInfo.certificate_of_good_conduct!}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registered Vehicle */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Registered Vehicle</CardTitle>
          <CardDescription>
            Current vehicle registered to this driver
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative aspect-video w-full md:w-1/3 rounded-lg overflow-hidden">
              <img
                src={
                  vehicleInfo?.vehicle_image_url ??
                  "https://placehold.co/600x400?text=Not+Found"
                }
                alt="Vehicle Image"
                className="object-cover"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">
                    {vehicleInfo?.vehicle_name}
                  </h2>
                  <p className="text-muted-foreground">
                    {vehicleInfo?.vehicle_model}
                  </p>
                </div>
                <Badge
                  className={
                    "text-white" +
                    (vehicleInfo?.is_inspected ? "bg-green-500" : "bg-red-500")
                  }
                >
                  {vehicleInfo?.is_inspected ? "Inspected" : "Not Inspected"}
                </Badge>
              </div>

              {vehicleInfo != null ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Model</p>
                    <p className="font-medium">{vehicleInfo?.vehicle_model}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="font-medium">{vehicleInfo?.vehicle_year}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      License Plate
                    </p>
                    <p className="font-medium">
                      {vehicleInfo?.registration_number}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Seat Capacity
                    </p>
                    <p className="font-medium">
                      {vehicleInfo?.seat_count} seats (
                      {vehicleInfo?.available_seats} available)
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">{vehicleInfo?.status}</p>
                  </div>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center">
                  No vehicle registered
                </div>
              )}

              {vehicleInfo != null && (
                <Link href={`/vehicles/${vehicleInfo.registration_number}`}>
                  <Button variant="outline" className="mt-2">
                    View Full Vehicle Details
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Transactions, Ride History, Assigned Rides */}
      <Card>
        <CardHeader>
          <CardTitle>Driver Activity</CardTitle>
          <CardDescription>
            View transactions, ride history, and assigned rides
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger
                value="transactions"
                className="flex items-center gap-2"
              >
                <Banknote className="h-4 w-4" />
                <span>Transactions</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Ride History</span>
              </TabsTrigger>
              <TabsTrigger value="assigned" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Assigned Rides</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4">
              <div className="rounded-md border">
                <GenTable
                  title="Transactions"
                  cols={[
                    "id",
                    "amount",
                    "kind",
                    "comments",
                    "transaction_type",
                    "created_at",
                  ]}
                  data={transactions}
                  baseLink="/transactions/"
                  uniqueKey="id"
                />
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="rounded-md border">
                <GenTable
                  title="Ride History"
                  cols={[
                    "id",
                    "passenger",
                    "status",
                    "start_time",
                    "end_time",
                    "kind",
                  ]}
                  data={tripHistory}
                  baseLink="/rides/trip/"
                  uniqueKey="id"
                />
              </div>
            </TabsContent>

            <TabsContent value="assigned" className="space-y-4">
              <div className="rounded-md border">
                <GenTable
                  title="Assigned Rides"
                  cols={["id", "name", "status", "created_at"]}
                  data={assignedRides}
                  baseLink="/rides/"
                  uniqueKey="id"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function KycDocumentCard({
  title,
  icon,
  imagePath,
}: {
  title: string;
  icon: React.ReactNode;
  imagePath: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="border rounded-lg p-4 flex flex-col items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <div className="text-center">
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-muted-foreground mt-1">Click to view</p>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Verification document submitted by the driver
          </DialogDescription>
        </DialogHeader>
        <div className="relative w-full">
          <img
            src={imagePath || "/placeholder.svg"}
            alt={title}
            className="object-contain rounded-md"
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Link href={imagePath} target="_blank">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
