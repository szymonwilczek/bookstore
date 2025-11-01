"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Package } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface OwnerInfoProps {
  owner: any;
}

export function OwnerInfo({ owner }: OwnerInfoProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={owner.profileImage} alt={owner.username} />
          <AvatarFallback>
            {owner.username?.substring(0, 2).toUpperCase() || "UN"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h4 className="font-semibold text-lg">{owner.username}</h4>
          <p className="text-sm text-muted-foreground">{owner.email}</p>
        </div>
      </div>

      <div className="space-y-3">
        {owner.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{owner.location}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span>{owner.averageRating?.toFixed(1) || "0.0"} / 5.0</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>{owner.points || 0} punktów</span>
        </div>
      </div>

      {owner.bio && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">{owner.bio}</p>
        </div>
      )}
    </Card>
  );
}
