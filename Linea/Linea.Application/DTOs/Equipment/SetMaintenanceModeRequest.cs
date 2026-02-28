using System;

namespace Linea.Application.DTOs.Equipment
{
    public sealed record SetMaintenanceModeRequest
    (
        string Reason
    );
}
