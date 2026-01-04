using System;
using API.Data;
using API.Extensions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class LogUserActivity :IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var resultContext = await next();

        if (context.HttpContext.User.Identity?.IsAuthenticated == true)
        {
            var userId = context.HttpContext.User.GetMemberId();
            var dbcontext = resultContext.HttpContext.RequestServices.GetService<AppDbContext>();
            await dbcontext!.Members.Where(x => x.Id == userId)
                .ExecuteUpdateAsync(s => s.SetProperty(m => m.LastActive, m => DateTime.UtcNow));
        }
                
    }
}
