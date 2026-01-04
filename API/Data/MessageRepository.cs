using System;
using API.DTO;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class MessageRepository(AppDbContext context) : IMessageRepository
{


    public async Task<Message?> GetMessage(string messageId)
    {
        return await context.Messages
           .Include(m => m.Sender)
           .Include(m => m.Recipient)
           .FirstOrDefaultAsync(m => m.Id == messageId);
    }



    public async Task<PaginatedResult<MessageDto>> GetMessagesForMember(MessageParams messageParams)
    {
        var query = context.Messages
            .OrderByDescending(m => m.MessageSent)
            .AsQueryable();

        if (messageParams.Container == "Inbox")
        {
            query = query.Where(m => m.RecipientId == messageParams.MemberId
            && m.RecipientDeleted == false);
        }
        else if (messageParams.Container == "Outbox")
        {
            query = query.Where(m => m.SenderId == messageParams.MemberId
             && m.SenderDeleted == false);
        }

        var messageQuery = query.Select(MessageExtentions.ToDtoProjection());

        var paginatedResult = await PaginationHelper.CreateAsync(messageQuery, messageParams.PageNumber, messageParams.PageSize);

        return paginatedResult;

    }

    public async Task<IReadOnlyList<MessageDto>> GetMessageThread(string currentMemberId, string recipientId)
    {
        await context.Messages
        .Where(x => x.RecipientId == currentMemberId && x.SenderId == recipientId &&
        x.DateRead == null).ExecuteUpdateAsync(x => x.SetProperty(x => x.DateRead, DateTime.UtcNow));

        return await context.Messages
            .Where(x => (x.RecipientId == currentMemberId && x.RecipientDeleted == false && x.SenderId == recipientId) ||
                        (x.RecipientId == recipientId && x.SenderDeleted == false && x.SenderId == currentMemberId))
            .OrderBy(x => x.MessageSent)
            .Include(m => m.Sender)
            .Include(m => m.Recipient)
            .Select(MessageExtentions.ToDtoProjection())
            .ToListAsync();
    }
    public void AddGroup(Group group)
    {
        context.Groups.Add(group);
    }
    public async Task<Group?> GetMessageGroup(string groupName)
    {
        return await context.Groups
        .Include(x=>x.Connections)
        .FirstOrDefaultAsync(x=>x.Name == groupName);
    }
    public async Task RemoveConnection(string connectionId)
    {
      await context.Connections.
      Where((con) => con.ConnectionId == connectionId)
      .ExecuteDeleteAsync();
     
    }

    public void AddMessage(Message message)
    {
        context.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
        context.Messages.Remove(message);
    }

    public async Task<Connection?> GetConnection(string connectionId)
    {
        return await context.Connections.FindAsync(connectionId);
    }

    public async Task<Group?> GetGroupForConnection(string connectionId)
    {
        return await context.Groups
        .Include(x=>x.Connections)
        .Where(x=>x.Connections.Any(c=>c.ConnectionId==connectionId)).FirstOrDefaultAsync();
    }

}
