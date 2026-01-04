using System;
using API.DTO;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class MessagesController(IUnitOfWork uow):BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
    {
        var sender = await uow.MemberRepository.GetMemberByIdAsync(User.GetMemberId());
        var recipient = await uow.MemberRepository.GetMemberByIdAsync(createMessageDto.RecipientId);

        if (recipient == null || sender == null || sender.Id == createMessageDto.RecipientId)
            return BadRequest("Cannot send this message");

        var message = new Message
        {
            SenderId = sender.Id,
            RecipientId = recipient.Id,
            Content = createMessageDto.Content
        };

        uow.MessageRepository.AddMessage(message);

        if (await uow.Complete()) return message.ToDto();

        return BadRequest("Failed to send message");
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResult<MessageDto>>> GetMessagesByContainer([FromQuery]MessageParams messageParams)
    {
        messageParams.MemberId = User.GetMemberId();
        var messages = await uow.MessageRepository.GetMessagesForMember(messageParams);
        return messages;
    }

    [HttpGet("thread/{recipientId}")]
    public async Task<ActionResult<IReadOnlyList<MessageDto>>> GetMessageThread(string recipientId)
    {
        var currentMemberId = User.GetMemberId();
        var messages = await uow.MessageRepository.GetMessageThread(currentMemberId, recipientId);
        return Ok(messages);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMessage(string id)
    {
        var currentMemberId = User.GetMemberId();

        var message = await uow.MessageRepository.GetMessage(id);
        if (message == null) return BadRequest("Cannot delete this message");

        
        if (message.SenderId != currentMemberId && message.RecipientId != currentMemberId)
            return BadRequest("Cannot delete this message");


        if (message.SenderId == currentMemberId) message.SenderDeleted = true;
        if (message.RecipientId == currentMemberId) message.RecipientDeleted = true;

        if(message is { SenderDeleted: true, RecipientDeleted: true })
        {
            uow.MessageRepository.DeleteMessage(message);
        }

        if (await uow.Complete()) return Ok();

        return BadRequest("Failed to delete message");
    }   

}